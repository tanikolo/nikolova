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
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    echo json_encode($output);
    exit;
}

$locationId = isset($_POST['id']) ? (int)$_POST['id'] : 0;

if ($locationId === 0) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failed";
    $output['status']['description'] = "Invalid location ID";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    echo json_encode($output);
    $conn->close();
    exit;
}

$checkQuery = $conn->prepare('SELECT COUNT(*) as count FROM department WHERE locationID = ?');
if ($checkQuery === false) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failed";
    $output['status']['description'] = "Query preparation failed";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    echo json_encode($output);
    $conn->close();
    exit;
}
$checkQuery->bind_param("i", $locationId);
$checkQuery->execute();
$checkResult = $checkQuery->get_result();
$row = $checkResult->fetch_assoc();
$checkQuery->close();

if ($row['count'] > 0) {
    $output['status']['code'] = "403";
    $output['status']['name'] = "forbidden";
    $output['status']['description'] = "Cannot delete location with assigned departments";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    echo json_encode($output);
    $conn->close();
    exit;
}

$query = $conn->prepare('DELETE FROM location WHERE id = ?');
if ($query === false) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failed";
    $output['status']['description'] = "Query preparation failed";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    echo json_encode($output);
    $conn->close();
    exit;
}
$query->bind_param("i", $locationId);
$query->execute();

if ($query->affected_rows === 0) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "Location not found";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    echo json_encode($output);
    $query->close();
    $conn->close();
    exit;
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = [];

$query->close();
$conn->close();
echo json_encode($output);
?>
