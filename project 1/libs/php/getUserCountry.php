<?php

// Display errors for debugging
ini_set('display_errors', 'On');
error_reporting(E_ALL);

// Your OpenCage API key
$apiKey = '65c121c9fa444dd7ae03527cd459f0be';

// Get the latitude and longitude from the request
$lat = $_GET['lat'];
$lon = $_GET['lon'];

// Use OpenCage API to get the country code from latitude and longitude
$openCageApiUrl = "https://api.opencagedata.com/geocode/v1/json?q=$lat+$lon&key=$apiKey";
$openCageApiResponse = file_get_contents($openCageApiUrl);
$openCageData = json_decode($openCageApiResponse, true);

$countryCode = $openCageData['results'][0]['components']['country_code'];

// Return the country code as JSON
header('Content-Type: application/json');
echo json_encode(['country_code' => $countryCode]);
?>

