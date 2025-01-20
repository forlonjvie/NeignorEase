<?php
$CN = mysqli_connect("localhost", "root", "", "admin_db");

if (!$CN) {
    die("Connection failed: " . mysqli_connect_error());
}

$username = $_GET['username']; 

// Corrected query to order the results after filtering by username
$query = "SELECT `md_id`, `name`, `house_num`, `month`, `year`, `amount`, `status` 
          FROM `montly_due`
          WHERE `name` = ?
          ORDER BY `md_id` DESC";

$stmt = $CN->prepare($query);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

$monthlyDues = [];

while ($due = $result->fetch_assoc()) {
    $monthlyDues[] = $due;
}

if (count($monthlyDues) > 0) {
    echo json_encode($monthlyDues);  // Return the array of monthly dues
} else {
    echo json_encode(["error" => "No due information found"]);
}

$stmt->close();
$CN->close();
?>
