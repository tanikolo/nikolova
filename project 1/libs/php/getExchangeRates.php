<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $amount = $_POST['amount'];
    $fromCurrency = $_POST['fromCurrency'];
    $toCurrency = $_POST['toCurrency'];

    $app_id = '42452e2a086244a2a32af87e383e0a96'; // Replace with your Open Exchange Rates App ID

    $url = "https://openexchangerates.org/api/latest.json?app_id={$app_id}&symbols={$fromCurrency},{$toCurrency}";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $response = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($response, true);

    if (isset($data['rates'][$fromCurrency]) && isset($data['rates'][$toCurrency])) {
        $rate = $data['rates'][$toCurrency] / $data['rates'][$fromCurrency];
        $convertedAmount = $amount * $rate;

        echo json_encode([
            'rate' => $rate,
            'convertedAmount' => $convertedAmount,
        ]);
    } else {
        echo json_encode([
            'error' => 'Currency not found'
        ]);
    }
} else {
    echo json_encode([
        'error' => 'Invalid request method'
    ]);
}
?>
