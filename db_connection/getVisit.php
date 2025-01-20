<?php
$CN = mysqli_connect("localhost", "root", "", "admin_db");

if (!$CN) {
    die("Connection failed: " . mysqli_connect_error());
}

// Get the username from the query parameter
$username = $_GET['username'];

// Query to exclude records where status = 'CONFIRMED' and sort by visit_date in descending order
$query = "SELECT `id`, `HO_name`, `Guest_lname`, `Guest_fname`, `Guest_mname`, `Guest_afname`, `Guest_photo`, 
                 `Guest_email`, `guest_contact`, `guest_add`, `HO_housenum`, `visit_date`, `Guest_num`, `relation`, `status`
          FROM `visits`
          WHERE `HO_name` = ? AND `status` != 'CONFIRMED'
          ORDER BY `visit_date` DESC";

$stmt = $CN->prepare($query);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

// Check if any guest records are found
if ($result->num_rows > 0) {
    $guests = [];
    while ($row = $result->fetch_assoc()) {
        $guests[] = $row;
    }
    echo json_encode($guests);
} else {
    echo json_encode(["error" => "No Visitor"]);
}

// Close the statement and connection
$stmt->close();
$CN->close();
?>
