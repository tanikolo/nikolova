<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include(__DIR__ . "/config.php");

header('Content-Type: application/json; charset=UTF-8');

if ($link->connect_errno) {
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable: " . $link->connect_error;
    $output['data'] = [];
    echo json_encode($output);
    exit;
}

$departmentID = isset($_POST['departmentID']) ? $_POST['departmentID'] : '';
$locationID = isset($_POST['locationID']) ? $_POST['locationID'] : '';

$queryStr = 'SELECT p.id, p.firstName, p.lastName, p.email, p.jobTitle, d.name as departmentName, l.name as locationName
    FROM personnel p
    LEFT JOIN department d ON d.id = p.departmentID
    LEFT JOIN location l ON l.id = d.locationID
    WHERE 1=1';

if ($departmentID) {
    $queryStr .= ' AND d.id = ?';
}
if ($locationID) {
    $queryStr .= ' AND l.id = ?';
}

$query = $link->prepare($queryStr);

if ($query === false) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "query preparation failed: " . $link->error;
    $output['data'] = [];
    echo json_encode($output);
    $link->close();
    exit;
}

$params = [];
$types = '';
if ($departmentID) {
    $types .= 'i';
    $params[] = $departmentID;
}
if ($locationID) {
    $types .= 'i';
    $params[] = $locationID;
}

if ($types) {
    $query->bind_param($types, ...$params);
}

$query->execute();

if ($query === false) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "query execution failed: " . $query->error;
    $output['data'] = [];
    echo json_encode($output);
    $link->close();
    exit;
}

$result = $query->get_result();

$data = [];

while ($row = mysqli_fetch_assoc($result)) {
    array_push($data, $row);
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['data'] = $data;

echo json_encode($output);

$link->close();

?>
