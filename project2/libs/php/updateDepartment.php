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

$id = isset($_POST['id']) ? intval($_POST['id']) : 0;
$name = isset($_POST['name']) ? $conn->real_escape_string($_POST['name']) : '';
$locationID = isset($_POST['locationID']) ? intval($_POST['locationID']) : 0;

if (empty($name) || $locationID === 0 || $id === 0) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "Invalid input data";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    echo json_encode($output);
    $conn->close();
    exit;
}

$query = $conn->prepare('UPDATE department SET name = ?, locationID = ? WHERE id = ?');
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

$query->bind_param("sii", $name, $locationID, $id);
$query->execute();

if ($query->affected_rows === 0) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "No rows updated";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
} else {
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
}

$query->close();
$conn->close();

echo json_encode($output);

?>
