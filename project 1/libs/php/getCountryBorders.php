<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$result = file_get_contents("countryBorders.geo.json");

header('Content-Type: application/json');
echo $result;
?>


