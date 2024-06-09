<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

if (!isset($_GET['country']) || empty($_GET['country'])) {
    echo json_encode([
        'status' => [
            'code' => 400,
            'name' => 'error',
            'description' => 'Missing country code parameter'
        ]
    ]);
    exit;
}

$countryCode = $_GET['country'];

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

$username = 'tanikolo';

$executionStartTime = microtime(true);

$url = "http://api.geonames.org/countryInfoJSON?formatted=true&lang=en&country=$countryCode&username=$username";

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

$output = [];

if (isset($decode['geonames']) && !empty($decode['geonames'])) {
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data'] = $decode['geonames'];
} else {
    $output['status']['code'] = "500";
    $output['status']['name'] = "error";
    $output['status']['description'] = "Failed to retrieve data";
}

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);

?>
