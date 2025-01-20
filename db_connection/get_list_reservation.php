<?php
// Allow cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "admin_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    sendResponse(500, ['error' => 'Database connection failed']);
    exit();
}

// Helper function to send JSON response
function sendResponse($statusCode, $data) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Get the request path
$request_uri = $_SERVER['REQUEST_URI'];
$uri_parts = explode('/', trim($request_uri, '/'));
$endpoint = end($uri_parts);

// Get request ID if present in URL
$request_id = null;
if (is_numeric($endpoint)) {
    $request_id = (int)$endpoint;
}

// Handle CORS preflight request
if ($method === 'OPTIONS') {
    sendResponse(200, []);
}

// Handle different HTTP methods
switch ($method) {
    case 'GET':
        if (isset($_GET['filter'])) {
            // Handle filtered requests
            $status = isset($_GET['status']) ? $_GET['status'] : null;
            $date = isset($_GET['date']) ? $_GET['date'] : null;
            $search = isset($_GET['search']) ? $_GET['search'] : null;

            $query = "SELECT vr.*, ho.fname as ho_fname, ho.lname as ho_lname, ho.email as ho_email 
                     FROM visit_requests vr 
                     LEFT JOIN home_owner ho ON vr.ho_username = ho.username 
                     WHERE 1=1";
            $params = [];
            $types = "";

            if ($status) {
                $query .= " AND vr.status = ?";
                $params[] = $status;
                $types .= "s";
            }
            if ($date) {
                $query .= " AND DATE(vr.visit_date) = ?";
                $params[] = $date;
                $types .= "s";
            }
            if ($search) {
                $query .= " AND (vr.guest_fname LIKE ? OR vr.guest_lname LIKE ? OR vr.guest_email LIKE ?)";
                $search_pattern = "%$search%";
                $params[] = $search_pattern;
                $params[] = $search_pattern;
                $params[] = $search_pattern;
                $types .= "sss";
            }

            $query .= " ORDER BY vr.visit_date DESC";
            
            $stmt = $conn->prepare($query);
            if (!empty($params)) {
                $stmt->bind_param($types, ...$params);
            }

        } elseif ($request_id) {
            // Get single request
            $stmt = $conn->prepare("SELECT vr.*, ho.fname as ho_fname, ho.lname as ho_lname, ho.email as ho_email 
                                  FROM visit_requests vr 
                                  LEFT JOIN home_owner ho ON vr.ho_username = ho.username 
                                  WHERE vr.request_id = ?");
            $stmt->bind_param("i", $request_id);

        } else {
            // Get all requests
            $stmt = $conn->prepare("SELECT vr.*, ho.fname as ho_fname, ho.lname as ho_lname, ho.email as ho_email 
                                  FROM visit_requests vr 
                                  LEFT JOIN home_owner ho ON vr.ho_username = ho.username 
                                  ORDER BY vr.visit_date DESC");
        }

        $stmt->execute();
        $result = $stmt->get_result();
        $data = [];

        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }

        sendResponse(200, $request_id ? ($data[0] ?? null) : $data);
        break;

    case 'POST':
        // Create new request
        $data = json_decode(file_get_contents('php://input'), true);

        // Validate required fields
        $required_fields = ['guest_fname', 'guest_lname', 'guest_email', 'guest_contact', 
                          'visit_date', 'ho_username', 'ho_housenum'];
        
        foreach ($required_fields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                sendResponse(400, ['error' => "Missing required field: $field"]);
            }
        }

        $stmt = $conn->prepare("INSERT INTO visit_requests 
                              (guest_fname, guest_lname, guest_email, guest_contact, 
                               guest_address, visit_date, ho_username, ho_housenum, status) 
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')");

        $stmt->bind_param("ssssssss", 
            $data['guest_fname'],
            $data['guest_lname'],
            $data['guest_email'],
            $data['guest_contact'],
            $data['guest_address'] ?? '',
            $data['visit_date'],
            $data['ho_username'],
            $data['ho_housenum']
        );

        if ($stmt->execute()) {
            $new_id = $stmt->insert_id;
            
            // Fetch the created request
            $stmt = $conn->prepare("SELECT vr.*, ho.fname as ho_fname, ho.lname as ho_lname, ho.email as ho_email 
                                  FROM visit_requests vr 
                                  LEFT JOIN home_owner ho ON vr.ho_username = ho.username 
                                  WHERE vr.request_id = ?");
            $stmt->bind_param("i", $new_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $new_request = $result->fetch_assoc();
            
            sendResponse(201, $new_request);
        } else {
            sendResponse(500, ['error' => 'Failed to create visit request']);
        }
        break;

    case 'PUT':
        // Update request status
        if (!$request_id) {
            sendResponse(400, ['error' => 'Request ID is required']);
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $status = $data['status'] ?? null;

        if (!$status) {
            sendResponse(400, ['error' => 'Status is required']);
        }

        // Validate status
        $valid_statuses = ['pending', 'approved', 'denied'];
        if (!in_array($status, $valid_statuses)) {
            sendResponse(400, ['error' => 'Invalid status']);
        }

        $stmt = $conn->prepare("UPDATE visit_requests SET status = ? WHERE request_id = ?");
        $stmt->bind_param("si", $status, $request_id);

        if ($stmt->execute()) {
            // Fetch updated request
            $stmt = $conn->prepare("SELECT vr.*, ho.fname as ho_fname, ho.lname as ho_lname, ho.email as ho_email 
                                  FROM visit_requests vr 
                                  LEFT JOIN home_owner ho ON vr.ho_username = ho.username 
                                  WHERE vr.request_id = ?");
            $stmt->bind_param("i", $request_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $updated_request = $result->fetch_assoc();
            
            sendResponse(200, $updated_request);
        } else {
            sendResponse(500, ['error' => 'Failed to update visit request']);
        }
        break;

    default:
        sendResponse(405, ['error' => 'Method not allowed']);
        break;
}

$conn->close();
?>