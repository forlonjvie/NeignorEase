<?php
  // Database connection
  $CN = mysqli_connect("localhost", "root", "", "admin_db");

  $rfid = $_GET['rfid'];

  if($rfid) {
    $sql = "SELECT HO_Id, username, fname, lname, hnum, con_num, email, mid_ini, RFID_ID FROM home_owner WHERE RFID_ID = '$rfid'";
    $result = $CN->query($sql);

    if ($result->num_rows > 0) {
      $homeownerData = $result->fetch_assoc();
      echo json_encode(['Status' => true, 'Data' => [$homeownerData]]);
    } else {
     // echo json_encode(['Status' => false, 'Message' => 'No data found for this RFID.']);
    }
  } else {
    echo json_encode(['Status' => false, 'Message' => 'RFID not provided.']);
  }

  $CN->close();
?>
