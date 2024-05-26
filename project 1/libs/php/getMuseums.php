<?php
$countryCode = $_POST['countryCode'];

$url = 'http://api.geonames.org/searchJSON?q=museum&country=' . $countryCode . '&maxRows=100&username=tanikolo';

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
$err = curl_error($ch);
curl_close($ch);

if ($err) {
    echo json_encode([]);
} else {
    $decode = json_decode($result, true);
    echo json_encode($decode['geonames']);
}
?>
