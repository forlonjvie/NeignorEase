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

$data = json_decode(file_get_contents('php://input'), true);
$postId = isset($data['postId']) ? intval($data['postId']) : 0;
$commentContent = isset($data['content']) ? trim($data['content']) : '';
$username = isset($data['username']) ? trim($data['username']) : '';

if ($postId <= 0 || empty($commentContent) || empty($username)) {
    echo json_encode([
        'Status' => false,
        'Message' => 'Invalid post ID, username, or comment content'
    ]);
    exit;
}

try {
   
    $query = "INSERT INTO comments (content, created_at, post_id, HO_username) VALUES (?, NOW(), ?, ?)";
    $stmt = mysqli_prepare($CN, $query);

    if ($stmt === false) {
        throw new Exception('Failed to prepare SQL statement: ' . mysqli_error($CN));
    }
    mysqli_stmt_bind_param($stmt, 'sis', $commentContent, $postId, $username);

    if (mysqli_stmt_execute($stmt)) {
        echo json_encode([
            'Status' => true,
            'Message' => 'Comment added successfully'
        ]);
    } else {
        echo json_encode([
            'Status' => false,
            'Message' => 'Error adding comment: ' . mysqli_stmt_error($stmt)
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
?>
