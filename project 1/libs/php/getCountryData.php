<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$countryData = json_decode(file_get_contents("countryBorders.geo.json"), true);

$data = array_map(function($feature) {
    return [
        'iso2' => $feature['properties']['iso_a2'],
        'name' => $feature['properties']['name']
    ];
}, $countryData['features']);

usort($data, fn($a, $b) => strcmp($a['name'], $b['name']));

header('Content-Type: application/json; charset=UTF-8');
echo json_encode([
    'status' => [
        'code' => 200,
        'name' => 'ok',
        'description' => 'success'
    ],
    'data' => $data
]);
?>

