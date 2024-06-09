<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

header('Content-Type: application/json');

$apiKey = '9qRgvO2Aa6IB9ttA88fW9LGMTAUspXJoTkiZNBpCxFNYPS4p';

if (!isset($_GET['country']) || empty($_GET['country'])) {
    echo json_encode([
        'status' => [
            'code' => 400,
            'name' => 'error',
            'description' => 'Missing country parameter'
        ]
    ]);
    exit;
}

$country = $_GET['country'];

if (!preg_match('/^[A-Z]{2}$/i', $country)) {
    echo json_encode([
        'status' => [
            'code' => 400,
            'name' => 'error',
            'description' => 'Invalid country code'
        ]
    ]);
    exit;
}

$url = 'https://api.currentsapi.services/v1/latest-news?country=' . urlencode($country) . '&apiKey=' . $apiKey;

$response = @file_get_contents($url);

if ($response === FALSE) {
    echo json_encode([
        'status' => [
            'code' => 500,
            'name' => 'error',
            'description' => 'Failed to fetch news'
        ],
        'details' => 'No news available for this region'
    ]);
    exit;
}

$data = json_decode($response, true);

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

if (isset($data['status']) && $data['status'] === 'ok' && !empty($data['news'])) {
    echo json_encode($data);
} else {
    echo json_encode([
        'status' => [
            'code' => 204,
            'name' => 'error',
            'description' => 'No news available'
        ],
        'details' => 'No news available for this region'
    ]);
}

?>
