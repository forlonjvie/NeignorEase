<?php
header('Content-Type: application/json');

// Include your database connection file
$CN = mysqli_connect("localhost", "root", "", "admin_db");

// Check the database connection
if (!$CN) {
    echo json_encode([
        'Status' => false,
        'Message' => 'Database connection failed'
    ]);
    exit;
}

// Validate title, description, and username from POST
$title = isset($_POST['title']) ? trim($_POST['title']) : '';
$description = isset($_POST['description']) ? trim($_POST['description']) : '';
$username = isset($_POST['username']) ? trim($_POST['username']) : '';

// Validate fields
if (empty($title) || empty($description) || empty($username)) {
    echo json_encode([
        'Status' => false,
        'Message' => 'Invalid title, description, or username'
    ]);
    exit;
}

// Directory for image uploads
$upload_dir = 'upload_img/';
$image_path = '';

if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $image_tmp = $_FILES['image']['tmp_name'];
    $image_name = basename($_FILES['image']['name']);
    $image_path = $upload_dir . $image_name;

    // Move uploaded file
    if (!move_uploaded_file($image_tmp, $image_path)) {
        echo json_encode([
            'Status' => false,
            'Message' => 'Error uploading image'
        ]);
        exit;
    }
}

try {
    // Prepare the SQL query to insert a new blog post
    $query = "INSERT INTO posts (title, content, created_at, HO_username, image_path) VALUES (?, ?, NOW(), ?, ?)";
    $stmt = mysqli_prepare($CN, $query);

    if ($stmt === false) {
        throw new Exception('Failed to prepare SQL statement: ' . mysqli_error($CN));
    }

    // Bind parameters: title, description, username, and image path
    mysqli_stmt_bind_param($stmt, 'ssss', $title, $description, $username, $image_path);

    // Execute the query
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode([
            'Status' => true,
            'Message' => 'Post added successfully'
        ]);
    } else {
        echo json_encode([
            'Status' => false,
            'Message' => 'Error adding post: ' . mysqli_stmt_error($stmt)
        ]);
    }

    // Close the statement
    mysqli_stmt_close($stmt);
} catch (Exception $e) {
    echo json_encode([
        'Status' => false,
        'Message' => 'Error: ' . $e->getMessage()
    ]);
}

// Close the database connection
mysqli_close($CN);
?>
