<?php
header('Content-Type: application/json');

$apiKey = '3d7638bc3accc494502191e34f8c7156'; 
$lat = $_GET['lat'];
$lon = $_GET['lon'];

$url = "https://api.openweathermap.org/data/2.5/weather?lat=$lat&lon=$lon&units=metric&appid=$apiKey";

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

$response = curl_exec($ch);

if(curl_errno($ch)) {

    $error_msg = curl_error($ch);
    echo json_encode(['error' => 'Unable to fetch weather data', 'details' => $error_msg]);
    curl_close($ch);
    exit();
}

$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

if ($http_code != 200) {

    echo json_encode(['error' => 'Unable to fetch weather data', 'http_code' => $http_code, 'response' => json_decode($response, true)]);
    exit();
}

echo $response;
?>
