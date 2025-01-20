<?php
// Connect to the database
$CN = mysqli_connect("localhost", "root", "", "admin_db");

if (!$CN) {
    die("Connection failed: " . mysqli_connect_error());
}

// Set the timezone to Philippine Time
date_default_timezone_set('Asia/Manila');

// Get the username from the query parameter
$username = $_GET['username']; 

// Get the current date in the format 'YYYY-MM-DD'
$currentDate = date('Y-m-d');

// Updated query to only include confirmed guests for the current day
$query = "SELECT id, HO_name, Guest_lname, Guest_fname, Guest_mname, Guest_afname, 
                 Guest_photo, Guest_email, guest_contact, guest_add, HO_housenum, 
                 visit_date, Guest_num, relation, status
          FROM visits 
          WHERE HO_name = ? AND status = 'CONFIRMED' AND DATE(visit_date) = ?";

$stmt = $CN->prepare($query);
$stmt->bind_param("ss", $username, $currentDate);
$stmt->execute();
$result = $stmt->get_result();

// Fetch and return the result
if ($result->num_rows > 0) {
    $guests = [];
    while ($row = $result->fetch_assoc()) {
        $guests[] = $row;
    }
    echo json_encode($guests);
} else {
    echo json_encode(["error" => "No confirmed guests found for today"]);
}

// Close the statement and connection
$stmt->close();
$CN->close();
?>
