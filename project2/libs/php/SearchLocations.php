<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include(__DIR__ . "/config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($host_name, $user_name, $password, $database);

if (mysqli_connect_errno()) {
    $output = [
        'status' => [
            'code' => "300",
            'name' => "failure",
            'description' => "database unavailable",
            'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
        ],
        'data' => []
    ];
    echo json_encode($output);
    exit;
}

$txt = isset($_GET['query']) ? $conn->real_escape_string($_GET['query']) : '';

if (empty($txt)) {
    $output = [
        'status' => [
            'code' => "400",
            'name' => "failed",
            'description' => "Missing or empty search text",
            'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
        ],
        'data' => []
    ];
    echo json_encode($output);
    $conn->close();
    exit;
}

$query = $conn->prepare('SELECT id, name FROM location WHERE name LIKE ? ORDER BY name');

if (false === $query) {
    $output = [
        'status' => [
            'code' => "400",
            'name' => "failed",
            'description' => "Query preparation failed: " . $conn->error,
            'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
        ],
        'data' => []
    ];
    echo json_encode($output);
    $conn->close();
    exit;
}

$likeText = "%" . $txt . "%";
$query->bind_param("s", $likeText);

$query->execute();

if (false === $query) {
    $output = [
        'status' => [
            'code' => "400",
            'name' => "failed",
            'description' => "Query execution failed: " . $query->error,
            'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
        ],
        'data' => []
    ];
    echo json_encode($output);
    $conn->close();
    exit;
}

$result = $query->get_result();
if (false === $result) {
    $output = [
        'status' => [
            'code' => "400",
            'name' => "failed",
            'description' => "Result fetching failed: " . $query->error,
            'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
        ],
        'data' => []
    ];
    echo json_encode($output);
    $conn->close();
    exit;
}

$found = [];

while ($row = mysqli_fetch_assoc($result)) {
    array_push($found, $row);
}

$output = [
    'status' => [
        'code' => "200",
        'name' => "ok",
        'description' => "success",
        'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
    ],
    'data' => ['found' => $found]
];

echo json_encode($output);

$conn->close();
?>
