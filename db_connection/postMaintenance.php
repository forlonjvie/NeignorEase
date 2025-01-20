<?php
header('Content-Type: application/json');

// Database connection
$CN = mysqli_connect("localhost", "root", "", "admin_db");

if (!$CN) {
    echo json_encode([
        'Status' => false,
        'Message' => 'Database connection failed'
    ]);
    exit;
}

// Directory for image uploads
$upload_dir = 'upload_img/';
$title = isset($_POST['title']) ? trim($_POST['title']) : '';
$description = isset($_POST['description']) ? trim($_POST['description']) : '';
$username = isset($_POST['username']) ? trim($_POST['username']) : '';

if (empty($title) || empty($description) || empty($username)) {
    echo json_encode([
        'Status' => false,
        'Message' => 'Invalid title, description, or username'
    ]);
    exit;
}

// Handling the image upload
$image_url = null;
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $image = $_FILES['image'];
    $image_name = basename($image['name']);
    $target_file = $upload_dir . $image_name;

    if (move_uploaded_file($image['tmp_name'], $target_file)) {
        $image_url = $target_file; // Save the image path
    } else {
        echo json_encode([
            'Status' => false,
            'Message' => 'Error uploading image.'
        ]);
        exit;
    }
}

try {
    $query = "INSERT INTO maintenance_request (title, content, created_at, HO_username, status, image_url) VALUES (?, ?, NOW(), ?, 'pending', ?)";
    $stmt = mysqli_prepare($CN, $query);

    if ($stmt === false) {
        throw new Exception('Failed to prepare SQL statement: ' . mysqli_error($CN));
    }

    mysqli_stmt_bind_param($stmt, 'ssss', $title, $description, $username, $image_url);
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode([
            'Status' => true,
            'Message' => 'Maintenance request added successfully'
        ]);
    } else {
        echo json_encode([
            'Status' => false,
            'Message' => 'Error adding request: ' . mysqli_stmt_error($stmt)
        ]);
    }

    mysqli_stmt_close($stmt);
} catch (Exception $e) {
    echo json_encode([
        'Status' => false,
        'Message' => 'Error: ' . $e->getMessage()
    ]);
}

mysqli_close($CN);
