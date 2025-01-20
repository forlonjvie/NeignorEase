<?php
// Establish the database connection
$CN = mysqli_connect("localhost", "root", "", "admin_db");

// Get the username from the query parameter
$username = $_GET['username']; 

// Check the database connection
if (!$CN) {
    echo json_encode([
        'Message' => 'Database connection failed',
        'Status' => false
    ]);
    exit;
}

// Modify the query to retrieve maintenance requests by HO_name
$query = "SELECT `request_id`, `title`, `content`, `created_at`, `HO_username`, `status` , `image_url` FROM `maintenance_request` WHERE `HO_username` = ? ORDER BY `request_id` DESC";

// Prepare the SQL statement
$stmt = mysqli_prepare($CN, $query);

// Bind parameters
mysqli_stmt_bind_param($stmt, 's', $username);

// Execute the statement
mysqli_stmt_execute($stmt);

// Get the result
$result = mysqli_stmt_get_result($stmt);

// Check if any rows are returned
if (mysqli_num_rows($result) > 0) {
    $requests = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $requests[] = $row;
    }
    $Message = "Data retrieved successfully";
    $Response = array("Message" => $Message, "Status" => true, "Data" => $requests);
} else {
    $Message = "No data found";
    $Response = array("Message" => $Message, "Status" => false);
}

// Return the response as JSON
echo json_encode($Response);

// Close the database connection
mysqli_close($CN);
?>
