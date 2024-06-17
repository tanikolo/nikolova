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
    echo json_encode([
        'status' => [
            'code' => '300',
            'name' => 'failure',
            'description' => 'database unavailable',
            'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
        ],
        'data' => []
    ]);
    exit;
}

$query = 'SELECT d.id, d.name, l.name as locationName FROM department d LEFT JOIN location l ON l.id = d.locationID ORDER BY d.name';

$result = $conn->query($query);

if (!$result) {
    echo json_encode([
        'status' => [
            'code' => '400',
            'name' => 'failure',
            'description' => 'query failed: ' . $conn->error,
            'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
        ],
        'data' => []
    ]);
    $conn->close();
    exit;
}

$data = [];

while ($row = mysqli_fetch_assoc($result)) {
    array_push($data, $row);
}

echo json_encode([
    'status' => [
        'code' => '200',
        'name' => 'ok',
        'description' => 'success',
        'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
    ],
    'data' => $data
]);

$conn->close();

?>
