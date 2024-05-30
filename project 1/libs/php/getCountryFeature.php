<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

if (!isset($_GET['countryCode'])) {
    echo json_encode([
        'status' => [
            'code' => 400,
            'name' => 'error',
            'description' => 'Missing country code parameter'
        ]
    ]);
    exit;
}

$countryCode = $_GET['countryCode'];

$geoJsonFile = 'countryBorders.geo.json'; 

if (!file_exists($geoJsonFile)) {
    echo json_encode([
        'status' => [
            'code' => 404,
            'name' => 'error',
            'description' => 'File not found'
        ]
    ]);
    exit;
}

$result = file_get_contents($geoJsonFile);

$decode = json_decode($result, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
        'status' => [
            'code' => 500,
            'name' => 'error',
            'description' => 'Invalid JSON data'
        ]
    ]);
    exit;
}

$countryFeature = null;
foreach ($decode['features'] as $feature) {
    if (strcasecmp($feature['properties']['iso_a2'], $countryCode) === 0) {
        $countryFeature = $feature;
        break;
    }
}

if ($countryFeature === null) {
    echo json_encode([
        'status' => [
            'code' => 404,
            'name' => 'error',
            'description' => 'Country not found'
        ]
    ]);
    exit;
}

$output['status']['code'] = 200;
$output['status']['name'] = 'ok';
$output['status']['description'] = 'success';
$output['data'] = $countryFeature;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>
