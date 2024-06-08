<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$geoJsonFile = "countryBorders.geo.json";

if (!file_exists($geoJsonFile)) {
    echo json_encode(['error' => 'GeoJSON file not found']);
    exit;
}

$result = file_get_contents($geoJsonFile);

if ($result === false) {
    echo json_encode(['error' => 'Failed to read GeoJSON file']);
    exit;
}

$decode = json_decode($result, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['error' => 'JSON decode error: ' . json_last_error_msg()]);
    exit;
}

if (!isset($decode['features'])) {
    echo json_encode(['error' => 'Invalid GeoJSON structure: "features" key missing']);
    exit;
}

$countries = [];

foreach ($decode['features'] as $feature) {

    if (isset($feature['properties']['iso_a2']) && isset($feature['properties']['name'])) {
        $countries[] = [
            'code' => $feature['properties']['iso_a2'],
            'name' => $feature['properties']['name']
        ];
    }
}

usort($countries, function($a, $b) {
    return $a["name"] <=> $b["name"];
});

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $countries;

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);
?>
