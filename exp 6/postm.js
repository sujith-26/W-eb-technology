var http = require('http');
var querystring = require('querystring');
const { MongoClient } = require('mongodb');

var url = 'mongodb://localhost:27017/';
var dbName = 'webtech';
var collectionName = 'details';
function onRequest(req, res) {
    let body = '';
    let hasEnded = false;
    req.on('data', function(chunk) {
        body += chunk;
    });
    req.on('end', async function() {
        if (hasEnded) return; 
        hasEnded = true; 
        var qs = querystring.parse(body);
        var name = qs["name"];
        var id = qs["id"];
        var gender = qs["gender"];
        var branch = qs["branch"];
        var mobileno = qs["mobileno"];
        var address = qs["address"];
        if (!name || !id || !gender || !branch || !mobileno || !address) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.write('Missing required fields');
            res.end();
            return;
        }
        try {
            const client = new MongoClient(url);
            await client.connect();
            const db = client.db(dbName);
            const collection = db.collection(collectionName);
            const employee = { name: name, id: id, gender: gender, branch: branch, mobileno: mobileno, address: address };
            const result = await collection.insertOne(employee);
            console.log('Document inserted with _id: ${result.insertedId}');
            await client.close();
        } catch (error) {
            console.error('Error:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write('Internal Server Error');
            res.end();
            return;
        }
        var htmlResponse = `
            <html>
            <head>
                <title>STUDENT Details</title>
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
                    th{
                        background-color:#ff5050;
                        color:white;
                    }
                    td {
                        background-color: #6a6a6a;
                        color:white;
                    }
                    tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                </style>
            </head>
            <body>
                <h1 style="text-align: center;">Employee Details</h1>
                <table>
                    <tr>
                        <th>Name</th>
                        <th>ID</th>
                        <th>Gender</th>
                        <th>Branch</th>
                        <th>Mobile No</th>
                        <th>Address</th>
                    </tr>
                    <tr>
                        <td>${name}</td>
                        <td>${id}</td>
                        <td>${gender}</td>
                        <td>${branch}</td>
                        <td>${mobileno}</td>
                        <td>${address}</td>
                    </tr>
                </table>
            </body>
            </html>
        `;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(htmlResponse);
        res.end();
    });
}
http.createServer(onRequest).listen(9000);
console.log('Server is running on port 9000...');