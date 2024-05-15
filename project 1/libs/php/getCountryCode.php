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
$apiKey = '65c121c9fa444dd7ae03527cd459f0be';
$url = "https://api.opencagedata.com/geocode/v1/json?q=" . $lat . "+" . $lon . "&key=" . $apiKey;

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

if (isset($decode['results'][0]['components']['country_code'])) {
    $countryCode = strtoupper($decode['results'][0]['components']['country_code']);
    echo json_encode([
        'status' => [
            'code' => 200,
            'name' => 'ok',
            'description' => 'success'
        ],
        'data' => [
            'countryCode' => $countryCode
        ]
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
