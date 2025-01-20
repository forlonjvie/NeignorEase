<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

// Database connection details
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "admin_db";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'error' => 'Connection failed: ' . $conn->connect_error]));
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

// Validate input
if (empty($data['guest_fname']) || empty($data['guest_lname']) || empty($data['guest_email']) || empty($data['visit_date'])) {
    die(json_encode(['success' => false, 'error' => 'Missing required fields']));
}

// Generate request ID
$requestId = time() . rand(1000, 9999);

// Prepare and execute SQL query
$sql = "INSERT INTO visit_requests (
    guest_fname,
    guest_lname,
    guest_mname,
    guest_email,
    guest_contact,
    guest_address,
    visit_date,
    ho_username,
    ho_housenum,
    relation,
    status
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "sssssssssss",
    $data['guest_fname'],
    $data['guest_lname'],
    $data['guest_mname'],
    $data['guest_email'],
    $data['guest_contact'],
    $data['guest_address'],
    $data['visit_date'],
    $data['ho_username'],
    $data['ho_housenum'],
    $data['relation'],
    $data['status']
);

if ($stmt->execute()) {
    $requestId = $conn->insert_id;

    // Send email to guest
    try {
        $recipientName = $data['guest_fname'] . ' ' . $data['guest_lname'];
        $recipientEmail = $data['guest_email'];

        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = '21-76937@g.batstate-u.edu.ph';
        $mail->Password = 'jepq uyqt wbdj tnyo';
        $mail->SMTPSecure = 'ssl';
        $mail->Port = 465;

        $mail->setFrom('21-76937@g.batstate-u.edu.ph', 'Visit Request System');
        $mail->addAddress($recipientEmail, $recipientName);

        // Generate view link
        $viewLink = "http://192.168.1.12/1Caps/4Capstone/app/db_connection/guest_view.php?request_id=" . $requestId;

        // Get status-specific content
        $statusColor = '';
        $statusMessage = '';
        $additionalInfo = '';

        switch($data['status']) {
            case 'APPROVED':
                $statusColor = '#28a745';
                $statusMessage = 'Your visit request has been approved!';
                $additionalInfo = '
                    <p>Please remember to:</p>
                    <ul>
                        <li>Arrive during your scheduled time</li>
                        <li>Bring a valid government-issued ID</li>
                        <li>Follow all subdivision protocols and guidelines</li>
                        <li>Park only in designated areas</li>
                    </ul>';
                break;
            case 'DENIED':
                $statusColor = '#dc3545';
                $statusMessage = 'Your visit request has been declined.';
                $additionalInfo = '
                    <p>If you would like to schedule another visit or have any questions, please contact the homeowner or subdivision office.</p>';
                break;
            default:
                $statusColor = '#ffc107';
                $statusMessage = 'Your visit request is pending approval.';
                $additionalInfo = '
                    <p>Your request is currently under review. You will receive another email once your request has been processed.</p>';
                break;
        }

        $mail->isHTML(true);
        $mail->Subject = 'Visit Request Update - ' . ucfirst(strtolower($data['status']));
        $mail->Body = "
        <html>
        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                <div style='text-align: center; margin-bottom: 30px;'>
                    <img src='https://your-logo-url.com' alt='Logo' style='max-width: 150px;'>
                </div>
                
                <div style='background-color: #f8f9fa; border-left: 4px solid {$statusColor}; padding: 20px; margin-bottom: 30px;'>
                    <h2 style='color: {$statusColor}; margin: 0;'>{$statusMessage}</h2>
                </div>
                
                <p>Dear {$recipientName},</p>
                
                <div style='background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                    <h3 style='color: #0A5039; margin-top: 0;'>Visit Details</h3>
                    <table style='width: 100%; border-collapse: collapse;'>
                        <tr>
                            <td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'><strong>Visit Date:</strong></td>
                            <td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'>{$data['visit_date']}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'><strong>House Number:</strong></td>
                            <td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'>{$data['ho_housenum']}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'><strong>Status:</strong></td>
                            <td style='padding: 8px 0; border-bottom: 1px solid #dee2e6;'>
                                <span style='color: {$statusColor}; font-weight: bold;'>{$data['status']}</span>
                            </td>
                        </tr>
                    </table>
                </div>
                
                {$additionalInfo}
                
                <div style='text-align: center; margin: 30px 0;'>
                    <a href='{$viewLink}' style='background-color: #0A5039; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;'>View Request Details</a>
                </div>
                
                <div style='background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 30px;'>
                    <p style='margin: 0; font-size: 14px; color: #666;'>For any questions or concerns, please contact:</p>
                    <p style='margin: 5px 0; font-size: 14px;'>
                        📞 Subdivision Office: (123) 456-7890<br>
                        ✉️ Email: office@subdivision.com
                    </p>
                </div>
                
                <hr style='border: 1px solid #eee; margin: 20px 0;'>
                
                <p style='font-size: 12px; color: #666; text-align: center;'>
                    This is an automated message. Please do not reply to this email.<br>
                    © 2025 Subdivision Name. All rights reserved.
                </p>
            </div>
        </body>
        </html>";

        $mail->send();
        echo json_encode(['success' => true, 'message' => 'Visit request created and email sent successfully']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => 'Email could not be sent. Mailer Error: ' . $mail->ErrorInfo]);
    }
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}

$stmt->close();
$conn->close();
?>