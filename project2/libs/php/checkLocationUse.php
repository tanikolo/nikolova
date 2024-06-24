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

$locationId = isset($_POST['id']) ? (int)$_POST['id'] : 0;

if ($locationId === 0) {
    $output = [
        'status' => [
            'code' => "400",
            'name' => "failed",
            'description' => "Invalid location ID",
            'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
        ],
        'data' => []
    ];
    echo json_encode($output);
    $conn->close();
    exit;
}

$query = $conn->prepare('SELECT l.name AS locationName, COUNT(d.id) as departmentCount FROM location l LEFT JOIN department d ON (d.locationID = l.id) WHERE l.id = ?');

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

$query->bind_param("i", $locationId);
$query->execute();

$result = $query->get_result();
$row = $result->fetch_assoc();

if ($row) {
    $output = [
        'status' => [
            'code' => "200",
            'name' => "ok",
            'description' => "success",
            'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
        ],
        'data' => [$row]
    ];
} else {
    $output = [
        'status' => [
            'code' => "400",
            'name' => "failed",
            'description' => "No data found",
            'returnedIn' => (microtime(true) - $executionStartTime) / 1000 . " ms"
        ],
        'data' => []
    ];
}

$conn->close();
echo json_encode($output);
?>
