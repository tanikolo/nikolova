<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$result = file_get_contents("countryBorders.geo.json");

function compare($a, $b) {
    return $a["name"] <=> $b["name"];
}

$decode = json_decode($result, true);
$countries = [];

foreach ($decode['features'] as $feature) {
    $countries[] = [
        'code' => $feature['properties']['iso_a2'],
        'name' => $feature['properties']['name']
    ];
}

usort($countries, "compare");

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $countries;

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);
?>


