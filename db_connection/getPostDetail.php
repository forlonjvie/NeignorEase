<?php
header('Content-Type: application/json');

$CN = mysqli_connect("localhost", "root", "", "admin_db");

if (!$CN) {
    echo json_encode([
        'Status' => false,
        'Message' => 'Database connection failed'
    ]);
    exit;
}

$postId = isset($_GET['postId']) ? intval($_GET['postId']) : 0;

if ($postId <= 0) {
    echo json_encode([
        'Status' => false,
        'Message' => 'Invalid post ID'
    ]);
    exit;
}

try {
    $query = "SELECT post_id, title, content, created_at, HO_username , image_path
          FROM posts 
              WHERE post_id = ?";
    $stmt = mysqli_prepare($CN, $query);

    if ($stmt === false) {
        throw new Exception('Failed to prepare SQL statement');
    }
    mysqli_stmt_bind_param($stmt, 'i', $postId);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $post = mysqli_fetch_assoc($result);

    if ($post) {
        echo json_encode([
            'Status' => true,
            'Data' => $post
        ]);
    } else {
        echo json_encode([
            'Status' => false,
            'Message' => 'Post not found'
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
