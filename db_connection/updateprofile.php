<?php
header('Content-Type: application/json');

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "admin_db";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]));
}

// Prepare variables
$fname = $_POST['fname'];
$lname = $_POST['lname'];
$hnum = $_POST['hnum'];
$con_num = $_POST['con_num'];
$email = $_POST['email'];
$username = $_POST['username'];
$password = isset($_POST['password']) ? $_POST['password'] : null;
$image_url = null;

// Hash the password if provided
$hashed_password = null;
if ($password) {
    $hashed_password = md5($password);
}

// Handle the image upload
$upload_dir = 'upload_img/';
if (isset($_FILES['ho_pic']) && $_FILES['ho_pic']['error'] === UPLOAD_ERR_OK) {
    $image = $_FILES['ho_pic'];
    $image_name = basename($image['name']);
    $target_file = $upload_dir . $image_name;

    // Move the uploaded file to the target directory
    if (move_uploaded_file($image['tmp_name'], $target_file)) {
        $image_url = $target_file;
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error uploading image.'
        ]);
        exit;
    }
}

// Get the current image and password from the database if not provided
$sql = "SELECT ho_pic, password FROM Home_Owner WHERE username=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();
$current_data = $result->fetch_assoc();
$stmt->close();

if (!$image_url) {
    $image_url = $current_data['ho_pic']; // Use existing image if no new image uploaded
}

if (!$hashed_password) {
    $hashed_password = $current_data['password']; // Use existing password if no new password provided
}

// Prepare to update the user profile
$update_stmt = $conn->prepare("UPDATE Home_Owner SET fname=?, Lname=?, hnum=?, con_num=?, email=?, ho_pic=?, password=? WHERE username=?");
$update_stmt->bind_param("ssssssss", $fname, $lname, $hnum, $con_num, $email, $image_url, $hashed_password, $username);

// Execute the query
if ($update_stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Profile updated successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error updating profile: ' . $update_stmt->error]);
}

$update_stmt->close();
$conn->close();
?>
