<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$app_id = '42452e2a086244a2a32af87e383e0a96';
$url = "https://openexchangerates.org/api/currencies.json";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

$response = curl_exec($ch);

if ($response === false) {
    echo json_encode([
        'error' => 'cURL error: ' . curl_error($ch)
    ]);
    curl_close($ch);
    exit;
}

curl_close($ch);

$data = json_decode($response, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['error' => 'Error decoding JSON response: ' . json_last_error_msg()]);
    exit;
}

if (empty($data)) {
    echo json_encode(['error' => 'Empty response from API']);
    exit;
}

echo json_encode($data);

?>
