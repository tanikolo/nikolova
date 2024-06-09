<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode([
        'status' => [
            'code' => 405,
            'name' => 'error',
            'description' => 'Invalid request method'
        ]
    ]);
    exit;
}

$accessToken = 'G3JJegFVDpZS5IqVmwoXTx3Tfcm29hH2NPuFgYM94o3DTkqDuI00x3xyRf37dEjW';

if (empty($accessToken)) {
    echo json_encode([
        'status' => [
            'code' => 500,
            'name' => 'error',
            'description' => 'Access token is missing'
        ]
    ]);
    exit;
}

echo json_encode([
    'status' => [
        'code' => 200,
        'name' => 'ok',
        'description' => 'success'
    ],
    'token' => $accessToken
]);

?>
