<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$apiKey = '65c121c9fa444dd7ae03527cd459f0be';

$lat = $_GET['lat'];
$lon = $_GET['lon'];

$openCageApiUrl = "https://api.opencagedata.com/geocode/v1/json?q=$lat+$lon&key=$apiKey";
$openCageApiResponse = file_get_contents($openCageApiUrl);
$openCageData = json_decode($openCageApiResponse, true);

$countryCode = $openCageData['results'][0]['components']['country_code'];

header('Content-Type: application/json');
echo json_encode(['country_code' => $countryCode]);
?>

