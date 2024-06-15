<?php
// Simulated order data (replace with actual data retrieval logic)
$orders = [
    '123456' => 'Shipped',
    '789012' => 'Processing',
    '345678' => 'Delivered',
];

// Check if orderId parameter is provided
if (isset($_GET['orderId'])) {
    $orderId = $_GET['orderId'];

    // Check if the order ID exists in the orders array
    if (array_key_exists($orderId, $orders)) {
        // Return order status
        $response = ['success' => true, 'status' => $orders[$orderId]];
    } else {
        // Order not found
        $response = ['success' => false];
    }

    // Return response as JSON
    header('Content-Type: application/json');
    echo json_encode($response);
} else {
    // If orderId parameter is not provided
    echo 'Invalid request';
}
?>
