<?php
header('Content-Type: application/json; charset=UTF-8');

if (!isset($_GET['geonamesInfo'])) {
    http_response_code(400); 
    echo json_encode(['error' => 'Missing required parameter: geonamesInfo']);
    exit;
}

$countryCode = $_GET['geonamesInfo'];
$username = 'tanikolo';  

$apiURL = "http://api.geonames.org/countryInfoJSON?country=$countryCode&username=$username";

$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, $apiURL);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_FAILONERROR, true);

$response = curl_exec($curl);

if (!$response) {
    http_response_code(500); 
    echo json_encode(['error' => curl_error($curl)]);
    curl_close($curl);
    exit;
}

curl_close($curl);

$data = json_decode($response, true);

if (!isset($data['geonames']) || empty($data['geonames'])) {
    http_response_code(404); 
    echo json_encode(['error' => 'No country information found for provided code.']);
    exit;
}

$result = $data['geonames'][0];
$output = [
    'continent' => $result['continentName'],
    'countryName' => $result['countryName'],
    'capital' => $result['capital'],
    'population' => $result['population'],
    'languages' => explode(',', $result['languages']),
    'areaInSqKm' => $result['areaInSqKm'],
    'currency' => $result['currencyCode']
];

echo json_encode(['data' => $output]);
