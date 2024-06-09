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

if (!preg_match('/^[A-Z]{2}$/i', $countryCode)) {
    echo json_encode([
        'status' => [
            'code' => 400,
            'name' => 'error',
            'description' => 'Invalid country code'
        ]
    ]);
    exit;
}

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

if ($result === false) {
    echo json_encode([
        'status' => [
            'code' => 500,
            'name' => 'error',
            'description' => 'Failed to read GeoJSON file'
        ]
    ]);
    exit;
}

$decode = json_decode($result, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
        'status' => [
            'code' => 500,
            'name' => 'error',
            'description' => 'JSON decode error: ' . json_last_error_msg()
        ]
    ]);
    exit;
}

if (!isset($decode['features'])) {
    echo json_encode([
        'status' => [
            'code' => 500,
            'name' => 'error',
            'description' => 'Invalid GeoJSON structure: "features" key missing'
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
