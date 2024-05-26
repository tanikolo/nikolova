<?php

// Display errors for debugging
ini_set('display_errors', 'On');
error_reporting(E_ALL);

// Read the country borders geojson file
$result = file_get_contents("countryBorders.geo.json");

// Return the content as JSON
header('Content-Type: application/json');
echo $result;
?>


