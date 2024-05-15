<?php

    // remove for production

ini_set('display_errors', 'On');
error_reporting(E_ALL);


$countryCode = $_GET['country'];

$executionStartTime = microtime(true);

$url = "http://api.geonames.org/countryInfoJSON?formatted=true&lang=it&country=$countryCode&username=tanikolo&style=full";

$ch = curl_init();

curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

curl_close($ch);

$decode = json_decode($result, true);

$output = [];

if (isset($decode['geonames']) && !empty($decode['geonames'])) {
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data'] = $decode['geonames'];
} else {
    $output['status']['code'] = "500";
    $output['status']['name'] = "error";
    $output['status']['description'] = "Failed to retrieve data";
}

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);

?>
