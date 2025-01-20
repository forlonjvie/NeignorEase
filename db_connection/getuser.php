<?php
header('Content-Type: application/json');

// Database connection details
$servername = "localhost";
$dbUsername = "root";
$dbPassword = "";
$dbname = "admin_db";

// Create a new mysqli connection
$conn = new mysqli($servername, $dbUsername, $dbPassword, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Get the username from the query parameter
$username = $_GET['username']; 

// Prepare and execute SQL query
$sql = "SELECT `HO_Id`, `username`, `fname`, `lname`, `hnum`, `con_num`, `email`,  `mid_ini` , `qr_code` , `ho_pic` FROM `home_owner` WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

// Fetch and return the result
if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    echo json_encode($user);
} else {
    echo json_encode(["error" => "User not found"]);
}

// Close the statement and connection
$stmt->close();
$conn->close();
?>
