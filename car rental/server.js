const http = require('http');
const querystring = require('querystring');
const { MongoClient, ObjectId } = require('mongodb');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const url = 'mongodb://localhost:27017';
const dbName = 'project';
const client = new MongoClient(url);

const carPrices = {
    'ford': 10000,
    'audi': 15000,
    'bmw': 13000,
    'benz': 20000,
};

async function insertBooking(bookingData) {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('booking');
        const result = await collection.insertOne(bookingData);
        return result.insertedId;
    } catch (err) {
        console.error('Error inserting booking:', err);
    } finally {
        await client.close();
    }
}

async function moveExpiredBookings() {
    try {
        await client.connect();
        const db = client.db(dbName);
        const bookingCollection = db.collection('booking');
        const reportCollection = db.collection('report');

        const now = new Date();
        const expiredBookings = await bookingCollection.find({ endTime: { $lt: now } }).toArray();

        for (const booking of expiredBookings) {
            const pricePerHour = carPrices[booking.carType];
            const totalAmount = pricePerHour * booking.rentalDuration;

            await reportCollection.insertOne({
                sno: booking.sno,
                name: booking.name,
                phone: booking.phone,
                carType: booking.carType,
                pickupTime: booking.pickupTime,
                endTime: booking.endTime,
                totalAmount: totalAmount
            });
            await bookingCollection.deleteOne({ _id: booking._id });
        }
    } catch (err) {
        console.error('Error moving expired bookings:', err);
    } finally {
        await client.close();
    }
}

cron.schedule('*/5 * * * *', moveExpiredBookings); // Run every 5 minutes

function onRequest(request, response) {
    if (request.method === 'POST' && request.url === '/submit') {
        let body = '';

        request.on('data', (chunk) => {
            body += chunk.toString();
        });

        request.on('end', async () => {
            const formData = querystring.parse(body);

            const bookingData = {
                sno: formData["sno"],
                name: formData["name"],
                phone: formData["phone"],
                email: formData["email"],
                address: formData["address"],
                carType: formData["car-type"],
                pickupDate: formData["pickup-date"],
                pickupTime: formData["pickup-time"],
                rentalDuration: parseInt(formData["rental-duration"]),
                startTime: new Date(),
                endTime: new Date(new Date(`${formData["pickup-date"]}T${formData["pickup-time"]}`).getTime() + parseInt(formData["rental-duration"]) * 3600000)
            };

            // Insert the booking data into MongoDB
            await insertBooking(bookingData);

            const htmlResponse = `
                <html>
                <head>
                    <title>Details</title>
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
                    <h1 style="text-align: center;">Details</h1>
                    <table>
                        <tr>
                            <th>sno</th>
                            <th>Name</th>
                            <th>Phone No</th>
                            <th>Email</th>
                            <th>Address</th>
                            <th>Car Type</th>
                            <th>Pickup Date</th>
                            <th>Pickup Time</th>
                            <th>Rental Duration</th>
                        </tr>
                        <tr>
                            <td>${bookingData.sno}</td>
                            <td>${bookingData.name}</td>
                            <td>${bookingData.phone}</td>
                            <td>${bookingData.email}</td>
                            <td>${bookingData.address}</td>
                            <td>${bookingData.carType}</td>
                            <td>${bookingData.pickupDate}</td>
                            <td>${bookingData.pickupTime}</td>
                            <td>${bookingData.rentalDuration}</td>
                        </tr>
                    </table>
                </body>
                </html>
            `;
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.write(htmlResponse);
            response.end();
        });
    } else if (request.method === 'GET' && request.url === '/bookings') {
        fs.readFile(path.join(__dirname, 'viewBookings.html'), (err, data) => {
            if (err) {
                response.writeHead(500, { 'Content-Type': 'text/plain' });
                response.end('500 Internal Server Error');
            } else {
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end(data);
            }
        });
    } else if (request.method === 'GET' && request.url === '/report') {
        generateReport(response);
    } else if (request.method === 'POST' && request.url.startsWith('/update')) {
        let body = '';
        request.on('data', (chunk) => {
            body += chunk.toString();
        });

        request.on('end', async () => {
            const formData = querystring.parse(body);
            const email = formData["email"];
            const newRentalDuration = parseInt(formData["rental-duration"]);

            try {
                await updateBooking(email, newRentalDuration);
                response.writeHead(200, { 'Content-Type': 'text/plain' });
                response.end('Booking updated successfully');
            } catch (err) {
                response.writeHead(500, { 'Content-Type': 'text/plain' });
                response.end('Error updating booking: ' + err.message);
            }
        });
    } else if (request.method === 'POST' && request.url === '/cancel') {
        let body = '';

        request.on('data', (chunk) => {
            body += chunk.toString();
        });

        request.on('end', async () => {
            const formData = querystring.parse(body);
            const email = formData["email"];

            try {
                const booking = await findBookingByEmail(email);

                if (!booking) {
                    throw new Error('Booking not found');
                }

                const remainingTime = (new Date(booking.endTime) - new Date()) / 3600000;

                if (remainingTime > 1) {
                    await cancelBooking(email);
                    response.writeHead(200, { 'Content-Type': 'text/plain' });
                    response.end('Booking cancelled successfully');
                } else {
                    response.writeHead(400, { 'Content-Type': 'text/plain' });
                    response.end('Cannot cancel the booking. Less than 1 hour remaining.');
                }
            } catch (err) {
                response.writeHead(500, { 'Content-Type': 'text/plain' });
                response.end('Error cancelling booking: ' + err.message);
            }
        });
    } else {
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.end('404 Not Found');
    }
}

async function findBookingByEmail(email) {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('booking');
        return await collection.findOne({ email });
    } catch (err) {
        console.error('Error finding booking by email:', err);
        throw err;
    } finally {
        await client.close();
    }
}

async function cancelBooking(email) {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('booking');
        await collection.deleteOne({ email });
    } catch (err) {
        console.error('Error cancelling booking:', err);
        throw err;
    } finally {
        await client.close();
    }
}

async function updateBooking(email, newRentalDuration) {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('booking');

        // Find the booking to update
        const booking = await collection.findOne({ email });

        if (!booking) {
            console.error(`Booking with email ${email} not found`);
            throw new Error('Booking not found');
        }

        console.log(`Booking found: ${JSON.stringify(booking)}`);

        // Calculate new end time
        const newEndTime = new Date(new Date(booking.startTime).getTime() + newRentalDuration * 3600000);

        // Update the booking
        const result = await collection.updateOne(
            { _id: new ObjectId(booking._id) }, // Corrected to instantiate ObjectId
            { $set: { rentalDuration: newRentalDuration, endTime: newEndTime } }
        );

        console.log(`Booking updated successfully: ${result.modifiedCount} document(s) modified`);
        return result.modifiedCount;
    } catch (err) {
        console.error('Error updating booking:', err);
        throw err;
    } finally {
        await client.close();
    }
}

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
                    <td>${report.pickupTime}</td>
                    <td>${report.endTime}</td>
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

async function generateBookings(response) {
    try {
        await client.connect();
        const db = client.db(dbName);
        const bookingCollection = db.collection('booking');
        const bookings = await bookingCollection.find().toArray();

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(bookings));
    } catch (err) {
        console.error('Error retrieving bookings:', err);
        response.writeHead(500, { 'Content-Type': 'text/plain' });
        response.end('500 Internal Server Error');
    } finally {
        await client.close();
    }
}

http.createServer(onRequest).listen(8000);
console.log('Server has started...');
