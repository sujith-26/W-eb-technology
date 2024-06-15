<?php
    // Check if the form is submitted
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        // Database connection parameters
        $servername = "localhost";
        $username = "root";
        $password = "";
        $dbname = "user_database";

        // Create connection
        $conn = new mysqli($servername, $username, $password, $dbname);

        // Check connection
        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }

        // Prepare SQL statement
        // Bind parameters

        // Set parameters and execute
        $cycleType = $_POST['cycle-type'];
        $pickupDate = $_POST['pickup-date'];
        $pickupTime = $_POST['pickup-time'];
        $rentalDuration = $_POST['rental-duration'];
        $address = $_POST['address'];
       
        $stmt = $conn->prepare("INSERT INTO bookings (cycle_type, pickup_date, pickup_time, rental_duration, address) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssis", $cycleType, $pickupDate, $pickupTime, $rentalDuration, $address);
        $stmt->execute();

        // Check if data is inserted successfully
        if ($stmt->affected_rows > 0) {
            echo "<script>alert('Booking successful!');</script>";
        } else {
            echo "<script>alert('Error: " . $stmt->error . "');</script>";
        }

        // Close statement and connection
        $stmt->close();
        $conn->close();
    }
    ?>