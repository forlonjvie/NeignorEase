<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "admin_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    error_log("No data received.");
    echo json_encode(['error' => 'No data received']);
    exit;
}

$guestName = $data['guestName'] ?? null;
$guestEmail = $data['guestEmail'] ?? null;
$hoName = $data['hoName'] ?? null;
$hoHousenum = $data['hoHousenum'] ?? null;
$otp = $data['otp'] ?? null;
$validity = $data['validity'] ?? null;
$arrival = $data['arrival'] ?? null;
$guestContact = $data['guestContact'] ?? null;

if (!$guestEmail || !$hoName || !$otp || !$validity) {
    error_log("Missing required fields.");
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

// Start transaction
$conn->begin_transaction();

try {
    // Update visits table
    $updateQuery = "UPDATE visits SET status = 'CONFIRMED' WHERE visit_date = ? AND Guest_email = ?";
    $stmt = $conn->prepare($updateQuery);
    $stmt->bind_param('ss', $arrival, $guestEmail);
    if (!$stmt->execute()) {
        throw new Exception("Error updating record: " . $stmt->error);
    }
    $stmt->close();

    // Generate QR code content
    $qrContent = "Guest Name: $guestName\nOTP: $otp\nValid Until: $validity\nContact: $guestContact";
    $qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?data=' . urlencode($qrContent) . '&size=200x200';

    // Save QR code to local directory
    $qrCodePath = saveQRCodeImage($qrCodeUrl, $guestName);
    if (!$qrCodePath) {
        throw new Exception("Error generating QR code.");
    }

    // Insert into accepted_guest table
    $insertQuery = "INSERT INTO accepted_guest (HO_name, Guest_name, OTP, Date_confirmed, Validity, contact, guest_qr) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($insertQuery);
    $stmt->bind_param('sssssss', $hoName, $guestName, $otp, $arrival, $validity, $guestContact, $qrCodePath);
    if (!$stmt->execute()) {
        throw new Exception("Error inserting record: " . $stmt->error);
    }
    $stmt->close();

    $conn->commit();

    // Send SMS with QR code link
    $qrCodeLink = "http://192.168.1.39/1Caps/4Capstone/app/db_connection/" . $qrCodePath;
    $smsMessage = "Dear $guestName, your visit request to $hoName is approved. Valid until $validity.\nOTP: $otp\nClick to view your QR code: $qrCodeLink";

    sendSMS($guestContact, $smsMessage);

    // Send email notification
    sendEmail($guestEmail, $guestName, $hoName, $validity, $otp);

    echo json_encode(['success' => 'Guest entry confirmed successfully']);
} catch (Exception $e) {
    $conn->rollback();
    error_log($e->getMessage());
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();

// Save the QR code image to a directory
function saveQRCodeImage($qrCodeUrl, $guestName) {
    $imageData = file_get_contents($qrCodeUrl);
    $filePath = 'guest_qr_code/' . $guestName . '_qr.png';
    if (file_put_contents($filePath, $imageData)) {
        return $filePath;
    }
    return false;
}

// Send SMS function
function sendSMS($phone, $message) {
    $smsData = [
        "secret" => "7f6d81f6ace863b5c8ccbd47d96fb9395eb889e8",
        "mode" => "devices",
        "device" => "00000000-0000-0000-c3f0-c6806f740ad9",
        "sim" => 1,
        "priority" => 1,
        "phone" => $phone,
        "message" => $message,
    ];

    $cURL = curl_init("https://www.cloud.smschef.com/api/send/sms");
    curl_setopt($cURL, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($cURL, CURLOPT_POSTFIELDS, $smsData);
    $response = curl_exec($cURL);
    curl_close($cURL);

    $result = json_decode($response, true);
    if ($result['status'] != 200) {
        throw new Exception("Failed to send SMS: " . $result['message']);
    }
}

// Send email function
function sendEmail($recipientEmail, $recipientName, $hoName, $validity, $otp) {
    require 'PHPMailer/src/Exception.php';
    require 'PHPMailer/src/PHPMailer.php';
    require 'PHPMailer/src/SMTP.php';

    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = '21-76937@g.batstate-u.edu.ph';
        $mail->Password = 'jepq uyqt wbdj tnyo';
        $mail->SMTPSecure = 'ssl';
        $mail->Port = 465;

        $mail->setFrom('21-76937@g.batstate-u.edu.ph', 'No Reply');
        $mail->addAddress($recipientEmail, $recipientName);

        $mail->isHTML(true);
        $mail->Subject = 'Guest Entry Confirmation';
        $mail->Body = "
        <html>
        <body>
            <p>Dear $recipientName,</p>
            <p>Your guest entry has been confirmed.</p>
            <p><strong>Home Owner Name:</strong> $hoName</p>
            <p><strong>Valid Until:</strong> $validity</p>
            <p><strong>OTP:</strong> $otp</p>
            <p>Thank you!</p>
        </body>
        </html>";

        if (!$mail->send()) {
            throw new Exception("Email not sent. Error: " . $mail->ErrorInfo);
        }
    } catch (Exception $e) {
        throw new Exception("Mailer Error: " . $e->getMessage());
    }
}
?>
