<?php
$CN = mysqli_connect("localhost", "root", "", "admin_db");

if (!$CN) {
    echo json_encode([
        'Status' => false,
        'Message' => 'Database connection failed'
    ]);
    exit;
}

// Corrected SQL query with FROM clause
$query = "SELECT post_id, title, content, created_at, HO_username , image_path
          FROM posts 
          ORDER BY post_id DESC";

$result = mysqli_query($CN, $query);

if (mysqli_num_rows($result) > 0) {
    $posts = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $posts[] = $row;
    }
    $Message = "Data retrieved successfully";
    $Response = array("Message" => $Message, "Status" => true, "Data" => $posts);
} else {
    $Message = "No data found";
    $Response = array("Message" => $Message, "Status" => false);
}

echo json_encode($Response);

// Close the database connection
mysqli_close($CN);
?>
