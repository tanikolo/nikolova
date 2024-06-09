<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Invalid request method']);
    exit;
}

if (!isset($_POST['code']) || empty($_POST['code'])) {
    echo json_encode(['error' => 'Missing currency code parameter']);
    exit;
}

$toCurrency = $_POST['code'];

if (!preg_match('/^[A-Z]{3}$/', $toCurrency)) {
    echo json_encode(['error' => 'Invalid currency code']);
    exit;
}

$app_id = '42452e2a086244a2a32af87e383e0a96'; 
$url = "https://openexchangerates.org/api/latest.json?app_id={$app_id}&symbols={$toCurrency}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

$response = curl_exec($ch);

if ($response === false) {
    echo json_encode(['error' => 'cURL error: ' . curl_error($ch)]);
    curl_close($ch);
    exit;
}

curl_close($ch);

$data = json_decode($response, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['error' => 'Error decoding JSON response: ' . json_last_error_msg()]);
    exit;
}

if (isset($data['rates'][$toCurrency])) {
    $rate = $data['rates'][$toCurrency];
    echo json_encode(['rate' => $rate]);
} else {
    echo json_encode(['error' => 'Currency not found']);
}
?>
