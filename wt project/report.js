async function generateReport(response) {
    try {
        await client.connect();
        const db = client.db(dbName);
        const reportCollection = db.collection('report');

        const reports = await reportCollection.find().toArray();
        
        let reportHtml = `
            <html>
            <head>
                <title>Report</title>
                <style>
                    table {
                        width: 80%;
                        margin: auto;
                        border-collapse: collapse;
                    }
                    th, td {
                        border: 1px solid #ccc;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                    tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                </style>
            </head>
            <body>
                <h1 style="text-align: center;">Completed Bookings Report</h1>
                <table>
                    <tr>
                        <th>sno</th>
                        <th>Name</th>
                        <th>Phone No</th>
                        <th>Car Type</th>
                        <th>Pickup Time</th>
                        <th>End Time</th>
                        <th>Total Amount</th>
                    </tr>`;

        for (const report of reports) {
            reportHtml += `
                <tr>
                    <td>${report.sno}</td>
                    <td>${report.name}</td>
                    <td>${report.phone}</td>
                    <td>${report.carType}</td>
                    <td>${formatDate(report.pickupTime)}</td>
                    <td>${formatDate(report.endTime)}</td>
                    <td>${report.totalAmount}</td>
                </tr>`;
        }

        reportHtml += `
                </table>
            </body>
            </html>`;

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(reportHtml);
        response.end();
    } catch (err) {
        console.error('Error generating report:', err);
        response.writeHead(500, { 'Content-Type': 'text/plain' });
        response.end('500 Internal Server Error');
    } finally {
        await client.close();
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}
