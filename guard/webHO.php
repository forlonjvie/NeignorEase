<?php
    $Write="<?php $" . "UIDresult=''; " . "echo $" . "UIDresult;" . " ?>";
    file_put_contents('UIDContainer.php',$Write);
?>



<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Student</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="css/sidebar.css">
    <script src="jquery.min.js"></script>
    <style>
        /* Main Content Styles */
        .main {
            padding: 20px;
            background-color: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            margin-top: 5px;
            flex-grow: 1; /* Allow the main content area to grow */
        }

        .content {
            margin-left: 264px; /* Align with the sidebar */
            padding: 20px; /* Padding around content */
            margin-top: 5px; /* Adjust for navbar height */
        }

        .main-title {
            font-size: 24px;
            font-weight: bold;
            color: #333; /* Adjust color as needed */
            margin-bottom: 20px; /* Space between title and content */
        }

        .form-group {
            margin-bottom: 20px; /* Space between form groups */
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
        }

        .form-group input,
        .form-group select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
        }

        .form-group button {
            padding: 10px 20px;
            background-color: #10a0c5;
            border: none;
            color: #fff;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 20px; /* Add margin above the button */
        }

        .form-group button:hover {
            background-color: #0e8a9c;
        }

        .message {
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 5px;
            font-weight: bold;
        }

        .message.success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .message.error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .message.hidden {
            display: none;
        }
    </style>
<script>
$(document).ready(function(){
    // Load the value from container.php and set it as the value of the input field
    $.get("UIDContainer.php", function(data){
        $("#student-uid").val(data); // Set the value of the input field
    });

    // Reload the value every second
    setInterval(function() {
        $.get("UIDContainer.php", function(data){
            $("#student-uid").val(data); // Set the updated value of the input field
        });
    }, 100);
});
</script>
</head>

<body>
    <?php include 'teacher_sidebar.php'; ?> 

    <div class="content">
        <div class="main-title"><i class="fa-solid fa-user-plus pe-2"></i> Add Student</div>
        <div class="main">
            <!-- Display message based on the query parameter -->
            <?php if (isset($_GET['status'])): ?>
                <div class="message <?php echo htmlspecialchars($_GET['status']); ?>" id="status-message">
                    <?php echo htmlspecialchars($_GET['status'] === 'success' ? 'Student added successfully!' : 'There was an error adding the student.'); ?>
                </div>
            <?php endif; ?>

            <!-- Add Student Form -->
            <form action="add_student_process.php" method="post">
                <div class="form-group">
                    <label for="student-uid">UID:</label>
                    <input type="text" id="student-uid" name="student-uid" readonly>
                </div>
                <div class="form-group">
                    <label for="fullname">Full Name:</label>
                    <input type="text" id="fullname" name="fullname" required>
                </div>
                <div class="form-group">
                    <label for="section">Section:</label>
                    <input type="text" id="section" name="section" required>
                </div>
                <div class="form-group">
                    <label for="subject">Subject:</label>
                    <select id="subject" name="subject" required>
                        <option value="">Select Subject</option>
                        <?php foreach ($subjects as $subject) { ?>
                            <option value="<?php echo htmlspecialchars($subject['code']); ?>">
                                <?php echo htmlspecialchars($subject['subject_name']); ?>
                            </option>
                        <?php } ?>
                    </select>
                </div>
                <div class="form-group">
                    <button type="submit">Add Student</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        document.addEventListener("DOMContentLoaded", function() {
            var message = document.getElementById('status-message');
            if (message) {
                setTimeout(function() {
                    message.classList.add('hidden');
                }, 1000); // Delay hiding for 1 second
            }
        });
    </script>
</body>

</html>
