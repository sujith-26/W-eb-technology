<?php
// Step 1: Establish connection to MySQL database
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "BikeRentalDB";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Step 2: Query the database to fetch data
$sql = "SELECT * FROM bookings";
$result = $conn->query($sql);

// Close database connection
$conn->close();
?>
