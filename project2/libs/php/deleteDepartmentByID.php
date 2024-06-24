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
    http_response_code(503);
    echo json_encode($output);
    exit;
}

$departmentId = isset($_POST['id']) ? (int)$_POST['id'] : 0;

if ($departmentId === 0) {
    $output = [
        'status' => [
            'code' => "400",
            'name' => "failed",
            'description' => "Invalid department ID",
            'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
        ],
        'data' => []
    ];
    http_response_code(400);
    echo json_encode($output);
    $conn->close();
    exit;
}

$query = $conn->prepare('DELETE FROM department WHERE id = ?');
if ($query === false) {
    $output = [
        'status' => [
            'code' => "400",
            'name' => "failed",
            'description' => "Query preparation failed: " . $conn->error,
            'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
        ],
        'data' => []
    ];
    http_response_code(500);
    echo json_encode($output);
    $conn->close();
    exit;
}

$query->bind_param("i", $departmentId);
$query->execute();

if ($query->affected_rows === 0) {
    $output = [
        'status' => [
            'code' => "400",
            'name' => "failed",
            'description' => "Department not found",
            'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
        ],
        'data' => []
    ];
    http_response_code(404);
    echo json_encode($output);
    $query->close();
    $conn->close();
    exit;
}

$output = [
    'status' => [
        'code' => "200",
        'name' => "ok",
        'description' => "success",
        'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
    ],
    'data' => []
];

http_response_code(200);
echo json_encode($output);
$query->close();
$conn->close();
?>
