<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

if (!isset($_POST['countryCode']) || empty($_POST['countryCode'])) {
    echo json_encode(['error' => 'Missing country code parameter']);
    exit;
}

$countryCode = $_POST['countryCode'];

if (!preg_match('/^[A-Z]{2}$/i', $countryCode)) {
    echo json_encode(['error' => 'Invalid country code']);
    exit;
}

$url = 'http://api.geonames.org/searchJSON?q=stadium&country=' . urlencode($countryCode) . '&maxRows=100&username=tanikolo';

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

if ($result === false) {
    echo json_encode(['error' => 'cURL error: ' . curl_error($ch)]);
    curl_close($ch);
    exit;
}

curl_close($ch);

$decode = json_decode($result, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['error' => 'JSON decode error: ' . json_last_error_msg()]);
    exit;
}

if (!isset($decode['geonames'])) {
    echo json_encode(['error' => 'Invalid API response: "geonames" key missing']);
    exit;
}

echo json_encode($decode['geonames']);

?>
