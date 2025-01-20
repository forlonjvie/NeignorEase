<?php
// Database connection configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "admin_db";

// Establish connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Function to add new visit details to the 'visits' table
function addNewVisit($conn, $requestData, $status) {
    $sql = "INSERT INTO visits 
        (HO_name, Guest_lname, Guest_fname, Guest_mname, Guest_afname, Guest_photo, Guest_email, guest_contact, guest_add, HO_housenum, visit_date, Guest_num, relation, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);

    // Handle missing fields with default values
    $hoName = $requestData['ho_username']; // Using username instead of fname
    $guestMname = $requestData['guest_mname'] ?? "N/A";
    $guestAfname = $requestData['guest_afname'] ?? "N/A";
    $guestPhoto = $requestData['guest_photo'] ?? "N/A";
    $guestEmail = $requestData['guest_email'] ?? "N/A";
    $guestContact = $requestData['guest_contact'] ?? "N/A";
    $guestAddress = $requestData['guest_address'] ?? "N/A";
    $guestNum = $requestData['guest_num'] ?? "N/A";
    $relation = $requestData['relation'] ?? "N/A";

    // Bind parameters
    $stmt->bind_param(
        "ssssssssssisss",
        $hoName,
        $requestData['guest_lname'],
        $requestData['guest_fname'],
        $guestMname,
        $guestAfname,
        $guestPhoto,
        $guestEmail,
        $guestContact,
        $guestAddress,
        $requestData['ho_housenum'],
        $requestData['visit_date'],
        $guestNum,
        $relation,
        $status
    );

    $success = $stmt->execute();
    $stmt->close();

    return $success;
}

// Function to update request status
function updateRequestStatus($conn, $requestId, $newStatus) {
    $updateSql = "UPDATE visit_requests SET status = ? WHERE request_id = ?";
    $stmt = $conn->prepare($updateSql);
    $stmt->bind_param("si", $newStatus, $requestId);
    $success = $stmt->execute();
    $stmt->close();

    // If update successful, add a record in 'visits' table
    if ($success) {
        $sql = "SELECT vr.*, ho.username AS ho_username
                FROM visit_requests vr 
                LEFT JOIN home_owner ho ON vr.ho_username = ho.username 
                WHERE vr.request_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $requestId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $requestData = $result->fetch_assoc();
            addNewVisit($conn, $requestData, $newStatus);
        }
        $stmt->close();
    }

    return $success;
}


// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $requestId = $_POST['request_id'] ?? 0;

    if (isset($_POST['approve'])) {
        if (updateRequestStatus($conn, $requestId, 'CONFIRMED')) {
            header("Location: guest_view.php?request_id=$requestId&status=CONFIRMED");
            exit();
        }
    } elseif (isset($_POST['deny'])) {
        if (updateRequestStatus($conn, $requestId, 'denied')) {
            header("Location: guest_view.php?request_id=$requestId&status=denied");
            exit();
        }
    }
}

// Fetch request details for display
$requestId = $_GET['request_id'] ?? 0;
$requestData = null;

if ($requestId > 0) {
    $sql = "SELECT vr.*, ho.fname AS ho_fname, ho.lname AS ho_lname 
            FROM visit_requests vr 
            LEFT JOIN home_owner ho ON vr.ho_username = ho.username 
            WHERE vr.request_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $requestId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $requestData = $result->fetch_assoc();
    }
    $stmt->close();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visit Request Details</title>
    <style>
        /* Reset and Base Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Roboto', Arial, sans-serif;
        }

        body {
            background-color: #f5f7fa;
            padding: 20px;
        }

        /* Main Container */
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        /* Header */
        .header {
            background-color: #2c3e50;
            color: #ecf0f1;
            padding: 20px;
            text-align: center;
        }

        .header h1 {
            font-size: 24px;
            font-weight: bold;
        }

        /* Content Section */
        .content {
            padding: 20px;
        }

        .section {
            margin-bottom: 25px;
        }

        .section-title {
            font-size: 20px;
            color: #34495e;
            margin-bottom: 10px;
            border-bottom: 2px solid #3498db;
            padding-bottom: 5px;
        }

        /* Info Grid */
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }

        .info-item {
            margin-bottom: 15px;
        }

        .info-label {
            font-size: 14px;
            color: #7f8c8d;
            margin-bottom: 5px;
        }

        .info-value {
            font-size: 16px;
            color: #2c3e50;
            font-weight: bold;
        }

        /* Buttons */
        .action-form {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 20px;
        }

        .btn {
            padding: 10px 20px;
            font-size: 16px;
            font-weight: bold;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-approve {
            background-color: #2ecc71;
            color: #ffffff;
        }

        .btn-approve:hover {
            background-color: #27ae60;
        }

        .btn-deny {
            background-color: #e74c3c;
            color: #ffffff;
        }

        .btn-deny:hover {
            background-color: #c0392b;
        }

        /* Status Banners */
        .status-banner {
            padding: 10px;
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 20px;
            border-radius: 5px;
        }

        .status-pending {
            background-color: #f1c40f;
            color: #ffffff;
        }

        .status-approved {
            background-color: #2ecc71;
            color: #ffffff;
        }

        .status-denied {
            background-color: #e74c3c;
            color: #ffffff;
        }

        /* Error Container */
        .error-container {
            text-align: center;
            padding: 40px 20px;
            color: #e74c3c;
        }

        .error-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <?php if ($requestData): ?>
            <div class="header">
                <h1>Visit Request Details</h1>
            </div>
            <div class="content">
                <h2>Request Information</h2>
                <p><strong>Request ID:</strong> <?php echo htmlspecialchars($requestId); ?></p>
                <p><strong>Status:</strong> <?php echo ucfirst(htmlspecialchars($requestData['status'])); ?></p>

                <h2>Guest Information</h2>
                <p><strong>Name:</strong> <?php echo htmlspecialchars($requestData['guest_fname']) . ' ' . htmlspecialchars($requestData['guest_lname']); ?></p>
                <p><strong>Email:</strong> <?php echo htmlspecialchars($requestData['guest_email']); ?></p>
                <p><strong>Contact:</strong> <?php echo htmlspecialchars($requestData['guest_contact']); ?></p>

                <h2>Visit Details</h2>
                <p><strong>Visit Date:</strong> <?php echo htmlspecialchars($requestData['visit_date']); ?></p>
                <p><strong>House Number:</strong> <?php echo htmlspecialchars($requestData['ho_housenum']); ?></p>

                <?php if ($requestData['status'] === 'pending'): ?>
                    <form method="POST" class="action-form">
                        <input type="hidden" name="request_id" value="<?php echo htmlspecialchars($requestId); ?>">
                        <button type="submit" name="approve" class="btn-approve">Approve</button>
                        <button type="submit" name="deny" class="btn-deny">Deny</button>
                    </form>
                <?php endif; ?>
            </div>
        <?php else: ?>
            <div class="error-container">
                <h2>Request Not Found</h2>
                <p>The requested details could not be found. Please check the request ID.</p>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
