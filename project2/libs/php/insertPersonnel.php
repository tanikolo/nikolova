<?php

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
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    echo json_encode($output);
    exit;
}

$firstName = isset($_POST['firstName']) ? $conn->real_escape_string($_POST['firstName']) : '';
$lastName = isset($_POST['lastName']) ? $conn->real_escape_string($_POST['lastName']) : '';
$jobTitle = isset($_POST['jobTitle']) ? $conn->real_escape_string($_POST['jobTitle']) : '';
$email = isset($_POST['email']) ? $conn->real_escape_string($_POST['email']) : '';
$departmentId = isset($_POST['departmentId']) ? intval($_POST['departmentId']) : 0;

if (empty($firstName) || empty($lastName) || empty($jobTitle) || empty($email) || $departmentId === 0) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "Invalid input data";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    echo json_encode($output);
    $conn->close();
    exit;
}

$query = $conn->prepare('INSERT INTO personnel (firstName, lastName, jobTitle, email, departmentID) VALUES(?, ?, ?, ?, ?)');
if ($query === false) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "Query preparation failed: " . $conn->error;
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    echo json_encode($output);
    $conn->close();
    exit;
}

$query->bind_param("ssssi", $firstName, $lastName, $jobTitle, $email, $departmentId);
$query->execute();

if ($query->affected_rows > 0) {
    $newId = $query->insert_id;
    $query->close();

    $query = $conn->prepare('SELECT p.id, p.firstName, p.lastName, p.email, d.name as departmentName, l.name as locationName FROM personnel p LEFT JOIN department d ON (d.id = p.departmentID) LEFT JOIN location l ON (l.id = d.locationID) WHERE p.id = ?');
    if ($query === false) {
        $output['status']['code'] = "400";
        $output['status']['name'] = "failure";
        $output['status']['description'] = "Query preparation failed: " . $conn->error;
        $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
        $output['data'] = [];
        echo json_encode($output);
        $conn->close();
        exit;
    }

    $query->bind_param("i", $newId);
    $query->execute();
    $result = $query->get_result();
    $data = $result->fetch_assoc();

    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = $data;
} else {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "Query execution failed: " . $query->error;
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
}

$query->close();
$conn->close();

echo json_encode($output);

?>
