<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

if (!isset($_GET['lat']) || !isset($_GET['lon'])) {
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

$geonamesUsername = 'tanikolo';
$url = "http://api.geonames.org/countryCodeJSON?lat=" . $lat . "&lng=" . $lon . "&username=" . $geonamesUsername;

$ch = curl_init();

curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

if ($result === false) {
    echo json_encode([
        'status' => [
            'code' => 500,
            'name' => 'error',
            'description' => 'cURL error: ' . curl_error($ch)
        ]
    ]);
    curl_close($ch);
    exit;
}

curl_close($ch);

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

if (isset($decode['countryCode'])) {
    echo json_encode([
        'status' => [
            'code' => 200,
            'name' => 'ok',
            'description' => 'success'
        ],
        'countryCode' => $decode['countryCode'],
        'countryName' => $decode['countryName']
    ]);
} else {
    echo json_encode([
        'status' => [
            'code' => 500,
            'name' => 'error',
            'description' => 'Failed to retrieve country code'
        ]
    ]);
}
?>
