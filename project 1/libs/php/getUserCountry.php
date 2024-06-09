<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

if (!isset($_GET['lat']) || !isset($_GET['lon']) || empty($_GET['lat']) || empty($_GET['lon'])) {
    echo json_encode([
        'status' => [
            'code' => 400,
            'name' => 'error',
            'description' => 'Missing latitude or longitude parameter'
        ]
    ]);
    exit;
}

$lat = $_GET['lat'];
$lon = $_GET['lon'];

if (!is_numeric($lat) || $lat < -90 || $lat > 90) {
    echo json_encode([
        'status' => [
            'code' => 400,
            'name' => 'error',
            'description' => 'Invalid latitude value'
        ]
    ]);
    exit;
}

if (!is_numeric($lon) || $lon < -180 || $lon > 180) {
    echo json_encode([
        'status' => [
            'code' => 400,
            'name' => 'error',
            'description' => 'Invalid longitude value'
        ]
    ]);
    exit;
}

$apiKey = '65c121c9fa444dd7ae03527cd459f0be';
$openCageApiUrl = "https://api.opencagedata.com/geocode/v1/json?q=$lat+$lon&key=$apiKey";

$openCageApiResponse = @file_get_contents($openCageApiUrl);

if ($openCageApiResponse === FALSE) {
    echo json_encode([
        'status' => [
            'code' => 500,
            'name' => 'error',
            'description' => 'Failed to fetch data from OpenCage API'
        ]
    ]);
    exit;
}

$openCageData = json_decode($openCageApiResponse, true);

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

if (!isset($openCageData['results'][0]['components']['country_code'])) {
    echo json_encode([
        'status' => [
            'code' => 404,
            'name' => 'error',
            'description' => 'Country code not found in the API response'
        ]
    ]);
    exit;
}

$countryCode = $openCageData['results'][0]['components']['country_code'];

header('Content-Type: application/json');
echo json_encode([
    'status' => [
        'code' => 200,
        'name' => 'ok',
        'description' => 'success'
    ],
    'country_code' => $countryCode
]);

?>
