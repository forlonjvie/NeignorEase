<?php
$CN = mysqli_connect("localhost", "root", "", "admin_db");
$username = $_GET['username']; // Get username from query string

$currentDate = date('Y-m-d'); 

// Update the SQL query to exclude both 'CONFIRMED' and 'DENY'
$query = "SELECT COUNT(*) AS visit_count 
          FROM `visits` 
          WHERE `HO_name` = ? 
          AND `status` NOT IN ('CONFIRMED', 'DENY')";

$stmt = mysqli_prepare($CN, $query);
mysqli_stmt_bind_param($stmt, "s", $username); 
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if ($result) {
    $row = mysqli_fetch_assoc($result);
    echo json_encode(['visit_count' => $row['visit_count']]);
} else {
    echo json_encode(["error" => "Failed to retrieve visits"]);
}

mysqli_stmt_close($stmt);
mysqli_close($CN);
?>
