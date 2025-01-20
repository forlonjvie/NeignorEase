<?php
$CN = mysqli_connect("localhost", "root", "");
$DB = mysqli_select_db($CN, "admin_db");
//$CN = mysqli_connect("localhost", "u483144460_jairus_junio", "NeighborEASE_2023");
//$DB = mysqli_select_db($CN, "u483144460_NeighborEASE");
$EncodedData = file_get_contents('php://input');
$DecodedData = json_decode($EncodedData, true);

$username = $DecodedData['email'];
$password = $DecodedData['password']; // This is already hashed by React Native

// Modify the query to include 'status = Active' and select specific columns
$query = "SELECT `HO_Id`, `username`, `fname`, `lname`, `hnum`, `con_num`, `email`, `mid_ini`, `RFID_ID`, `ho_pic`, `qr_code`, `password`, `status` 
          FROM `home_owner` 
          WHERE email = '$username' AND password = '$password' AND status = 'Active'";

$result = mysqli_query($CN, $query);

if (mysqli_num_rows($result) > 0) {
    $userData = mysqli_fetch_assoc($result); // Fetch user data
    $Message = "Login successful";
    $Response = array("Message" => $Message, "Status" => true, "userData" => $userData);
} else {
    $Message = "Invalid username, password, or inactive status";
    $Response = array("Message" => $Message, "Status" => false);
}

echo json_encode($Response);
?>
