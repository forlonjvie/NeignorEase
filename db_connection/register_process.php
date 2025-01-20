<?php
// Database connection parameters
//$CN = mysqli_connect("localhost", "u483144460_jairus_junio", "NeighborEASE_2023");
//$DB = mysqli_select_db($CN, "u483144460_NeighborEASE");
$host = 'localhost'; // Database host
$db_name = 'admin_db'; // Database name
$username = 'root'; // Database username
$password = ''; // Database password
// $host = 'localhost'; // Database host
// $db_name = 'u483144460_NeighborEASE'; // Database name
// $username = 'u483144460_jairus_junio'; // Database username
// $password = 'NeighborEASE_2023'; // Database password
// Establishing a database connection
$conn = new mysqli($host, $username, $password, $db_name);

// Check for connection errors
if ($conn->connect_error) {
    die(json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $conn->connect_error
    ]));
}

// Prepare variables
$username = $_POST['username'] ?? '';
$Fname = $_POST['Fname'] ?? '';
$Lname = $_POST['Lname'] ?? '';
$hnum = $_POST['hnum'] ?? '';
$con_num = $_POST['con_num'] ?? '';
$email = $_POST['email'] ?? '';
$mid_ini = $_POST['mid_ini'] ?? '';
$password = isset($_POST['password']) ? md5($_POST['password']) : null; // Hashing the password if set

// Validate that password is set
if ($password === null) {
    echo json_encode([
        'success' => false,
        'message' => 'Password is required.'
    ]);
    exit;
}

// Format the contact number and validate it
if (substr($con_num, 0, 3) !== "+63") {
    $con_num = "+63" . ltrim($con_num, '0'); // Ensure the contact number starts with +63
}
$formatted_contact = ltrim($con_num, "+63");

// Check if the contact number has exactly 10 digits
if (strlen($formatted_contact) !== 10) {
    echo json_encode([
        'success' => false,
        'message' => 'Contact number must be exactly 10 digits after the country code.'
    ]);
    exit;
}

// Check for existing username or email
$stmt = $conn->prepare("SELECT COUNT(*) FROM home_owner WHERE email = ? OR username = ?");
$stmt->bind_param('ss', $email, $username);
$stmt->execute();
$stmt->bind_result($count);
$stmt->fetch();
$stmt->close();

if ($count > 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Email or username already taken.'
    ]);
    exit;
}

// Handle the image upload
$upload_dir = 'upload_img/'; // Directory where images will be saved
$image_url = null;
if (isset($_FILES['ho_pic']) && $_FILES['ho_pic']['error'] === UPLOAD_ERR_OK) {
    $image = $_FILES['ho_pic'];
    $image_name = basename($image['name']);
    $target_file = $upload_dir . $image_name;

    // Move the uploaded file to the target directory
    if (move_uploaded_file($image['tmp_name'], $target_file)) {
        $image_url = $target_file; // Save the image path
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error uploading image.'
        ]);
        exit;
    }
}

// Prepare the SQL statement
$stmt = $conn->prepare("INSERT INTO home_owner (username, fname, lname, hnum, con_num, email, mid_ini, ho_pic, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param('sssssssss', $username, $Fname, $Lname, $hnum, $con_num, $email, $mid_ini, $image_url, $password);

// Execute the statement and check for success
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Homeowner registered successfully!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
}

// Close connections
$stmt->close();
$conn->close();
?>
