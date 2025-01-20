<?php
// Establish connection to the database
$CN = mysqli_connect("localhost", "root", "", "admin_db");

if (!$CN) {
    die("Connection failed: " . mysqli_connect_error());
}

$username = $_GET['username'];

// Update the query to cast the total_amount to an integer (whole number)
$query = "SELECT SUM(CAST(`amount` AS UNSIGNED)) as total_amount, `status`, MIN(CONCAT(`year`, '-', `month`, '-01')) as first_overdue_date
          FROM `montly_due`
          WHERE `name` = ? AND `status` = 'Overdue'";

$stmt = $CN->prepare($query);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $due = $result->fetch_assoc();
    
    // Ensure total_amount is an integer
    $totalAmount = (int)$due['total_amount'];

    $firstOverdueDate = $due['first_overdue_date'];
    $currentDate = date('Y-m-d');
    $daysOverdue = (strtotime($currentDate) - strtotime($firstOverdueDate)) / (60 * 60 * 24);
    
    echo json_encode([
        'amount' => $totalAmount, // Return the total amount as an integer
        'status' => $due['status'],
        'days_overdue' => $daysOverdue
    ]);
} else {
    echo json_encode(["error" => "No due information found"]);
}

$stmt->close();
$CN->close();
?>
