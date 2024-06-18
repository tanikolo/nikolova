<?php

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
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    $output['data'] = [];
    echo json_encode($output);
    exit;
}

$id = isset($_POST['id']) ? intval($_POST['id']) : 0;
$firstName = isset($_POST['firstName']) ? $conn->real_escape_string($_POST['firstName']) : '';
$lastName = isset($_POST['lastName']) ? $conn->real_escape_string($_POST['lastName']) : '';
$jobTitle = isset($_POST['jobTitle']) ? $conn->real_escape_string($_POST['jobTitle']) : '';
$email = isset($_POST['email']) ? $conn->real_escape_string($_POST['email']) : '';
$departmentID = isset($_POST['departmentID']) ? intval($_POST['departmentID']) : 0;

if (empty($firstName) || empty($lastName) || empty($jobTitle) || empty($email) || $id === 0 || $departmentID === 0) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "Invalid input data";
    $output['data'] = [];
    echo json_encode($output);
    $conn->close();
    exit;
}

$query = $conn->prepare('UPDATE personnel SET firstName = ?, lastName = ?, jobTitle = ?, email = ?, departmentID = ? WHERE id = ?');
if ($query === false) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "Query preparation failed: " . $conn->error;
    $output['data'] = [];
    echo json_encode($output);
    $conn->close();
    exit;
}

$query->bind_param("ssssii", $firstName, $lastName, $jobTitle, $email, $departmentID, $id);
$query->execute();

if ($query->affected_rows === 0) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "No rows updated";
    $output['data'] = [];
} else {
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['data'] = [];
}

$query->close();
$conn->close();

echo json_encode($output);

?>
