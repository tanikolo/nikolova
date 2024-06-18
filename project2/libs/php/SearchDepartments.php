<?php

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

$searchText = isset($_POST['txt']) ? '%' . $conn->real_escape_string($_POST['txt']) . '%' : '%';

$query = $conn->prepare('SELECT d.id, d.name, l.name as locationName FROM department d LEFT JOIN location l ON d.locationID = l.id WHERE d.name LIKE ? OR l.name LIKE ? ORDER BY d.name, l.name');

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

$query->bind_param('ss', $searchText, $searchText);

$query->execute();

if (false === $query) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failed";
    $output['status']['description'] = "Query execution failed: " . $query->error;
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    echo json_encode($output);
    $conn->close();
    exit;
}

$result = $query->get_result();
if (false === $result) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failed";
    $output['status']['description'] = "Result fetching failed: " . $query->error;
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    echo json_encode($output);
    $conn->close();
    exit;
}

$data = [];

while ($row = mysqli_fetch_assoc($result)) {
    array_push($data, $row);
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $data;

echo json_encode($output);

$conn->close();
?>
