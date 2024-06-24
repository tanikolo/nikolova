<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include(__DIR__ . "/config.php");

header('Content-Type: application/json; charset=UTF-8');

if (!isset($host_name) || !isset($user_name) || !isset($password) || !isset($database)) {
    echo json_encode([
        'status' => [
            'code' => '500',
            'name' => 'failure',
            'description' => 'Configuration variables are not set'
        ],
        'data' => []
    ]);
    exit;
}

$conn = new mysqli($host_name, $user_name, $password, $database);

if (mysqli_connect_errno()) {
    $output = [
        'status' => [
            'code' => "300",
            'name' => "failure",
            'description' => "database unavailable"
        ],
        'data' => []
    ];
    echo json_encode($output);
    exit;
}

$id = isset($_POST['id']) ? intval($_POST['id']) : 0;
$firstName = isset($_POST['firstName']) ? trim($_POST['firstName']) : '';
$lastName = isset($_POST['lastName']) ? trim($_POST['lastName']) : '';
$jobTitle = isset($_POST['jobTitle']) ? trim($_POST['jobTitle']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$departmentID = isset($_POST['departmentID']) ? intval($_POST['departmentID']) : 0;

if (empty($firstName) || empty($lastName) || empty($jobTitle) || empty($email) || $id === 0 || $departmentID === 0) {
    $output = [
        'status' => [
            'code' => "400",
            'name' => "failure",
            'description' => "Invalid input data"
        ],
        'data' => []
    ];
    echo json_encode($output);
    $conn->close();
    exit;
}

$query = $conn->prepare('UPDATE personnel SET firstName = ?, lastName = ?, jobTitle = ?, email = ?, departmentID = ? WHERE id = ?');
if ($query === false) {
    $output = [
        'status' => [
            'code' => "400",
            'name' => "failure",
            'description' => "Query preparation failed: " . $conn->error
        ],
        'data' => []
    ];
    echo json_encode($output);
    $conn->close();
    exit;
}

$query->bind_param("ssssii", $firstName, $lastName, $jobTitle, $email, $departmentID, $id);
$query->execute();

if ($query->affected_rows === 0) {
    $output = [
        'status' => [
            'code' => "400",
            'name' => "failure",
            'description' => "No rows updated"
        ],
        'data' => []
    ];
} else {
    $output = [
        'status' => [
            'code' => "200",
            'name' => "ok",
            'description' => "success"
        ],
        'data' => []
    ];
}

$query->close();
$conn->close();

echo json_encode($output);

?>
