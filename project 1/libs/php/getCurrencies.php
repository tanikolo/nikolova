<?php
if (isset($_GET['currencies'])) {
    $app_id = '42452e2a086244a2a32af87e383e0a96'; 
    $url = "https://openexchangerates.org/api/currencies.json?app_id={$app_id}";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $response = curl_exec($ch);
    curl_close($ch);

    echo $response;
    exit;
}
?>