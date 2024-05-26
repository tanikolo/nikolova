<?php
header('Content-Type: application/json');

$apiKey = '9qRgvO2Aa6IB9ttA88fW9LGMTAUspXJoTkiZNBpCxFNYPS4p';
$country = $_GET['country'];
$url = 'https://api.currentsapi.services/v1/latest-news?country=' . $country . '&apiKey=' . $apiKey;

$response = @file_get_contents($url);

if ($response === FALSE) {
    echo json_encode([
        'error' => 'Failed to fetch news',
        'details' => 'No news available for this region'
    ]);
} else {
    $data = json_decode($response, true);
    if (isset($data['status']) && $data['status'] === 'ok') {
        echo json_encode($data);
    } else {
        echo json_encode([
            'error' => 'Failed to fetch news',
            'details' => 'Unexpected API response'
        ]);
    }
}
?>







