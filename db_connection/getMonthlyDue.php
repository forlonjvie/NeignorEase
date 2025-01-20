<?php
$CN = mysqli_connect("localhost", "root", "", "admin_db");

if (!$CN) {
    die("Connection failed: " . mysqli_connect_error());
}

$username = $_GET['username']; 

$query = "SELECT `md_id`, `name`, `house_num`, `month`, `year`, `amount`, `status` 
          FROM `montly_due`
          WHERE `name` = ? AND `status` IN ('Overdue', 'Pending')";


$stmt = $CN->prepare($query);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

$overdue = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $overdue[] = $row;
    }
    echo json_encode($overdue);
} else {
    echo json_encode(["error" => "No overdue information found"]);
}

$stmt->close();
$CN->close();
?>
