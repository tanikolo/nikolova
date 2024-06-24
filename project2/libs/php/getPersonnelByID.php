<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include(__DIR__ . "/config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($host_name, $user_name, $password, $database);

if (mysqli_connect_errno()) {
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    $output['data'] = [];
    echo json_encode($output);
    exit;
}

$personnelId = isset($_POST['id']) ? (int)$_POST['id'] : 0;

if ($personnelId === 0) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failed";
    $output['status']['description'] = "Invalid personnel ID";
    $output['data'] = [];
    echo json_encode($output);
    $conn->close();
    exit;
}

$query = $conn->prepare('SELECT p.id, p.firstName, p.lastName, p.email, p.jobTitle, p.departmentID, d.name AS department FROM personnel p JOIN department d ON p.departmentID = d.id WHERE p.id = ?');
$query->bind_param("i", $personnelId);
$query->execute();

$result = $query->get_result();
$personnel = $result->fetch_assoc();

$departmentsQuery = $conn->prepare('SELECT id, name FROM department ORDER BY name');
$departmentsQuery->execute();
$departmentsResult = $departmentsQuery->get_result();
$departments = $departmentsResult->fetch_all(MYSQLI_ASSOC);

if ($personnel) {
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['data'] = ['personnel' => [$personnel], 'department' => $departments];
} else {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failed";
    $output['status']['description'] = "No data found";
    $output['data'] = [];
}

$conn->close();
echo json_encode($output);
?>
