<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);


$countryData = json_decode(file_get_contents("countryBorders.geo.json"), true);

if (!isset($_GET['iso2'])) {
    echo json_encode([
        'status' => [
            'code' => 400,
            'name' => 'error',
            'description' => 'Missing iso2 parameter'
        ]
    ]);
    exit;
}

$iso2 = $_GET['iso2'];
$countryBorders = array_filter($countryData['features'], fn($feature) => $feature['properties']['iso_a2'] === $iso2);

if (empty($countryBorders)) {
    echo json_encode([
        'status' => [
            'code' => 404,
            'name' => 'error',
            'description' => 'Country borders not found'
        ]
    ]);
} else {
    echo json_encode([
        'status' => [
            'code' => 200,
            'name' => 'ok',
            'description' => 'success'
        ],
        'data' => reset($countryBorders)
    ]);
}
?>

