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

$personnelId = isset($_POST['id']) ? (int)$_POST['id'] : 0;

if ($personnelId === 0) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failed";
    $output['status']['description'] = "Invalid personnel ID";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    echo json_encode($output);
    $conn->close();
    exit;
}

$query = $conn->prepare('DELETE FROM personnel WHERE id = ?');
if (false === $query) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failed";
    $output['status']['description'] = "Query preparation failed: " . $conn->error;
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    echo json_encode($output);
    $conn->close();
    exit;
}
$query->bind_param("i", $personnelId);
$query->execute();

if ($query->affected_rows === 0) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "Personnel not found";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    echo json_encode($output);
    $conn->close();
    exit;
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = [];

$conn->close();
echo json_encode($output);
?>
