<?php

$apiKey = '3d7638bc3accc494502191e34f8c7156'; 

function returnErrorResponse($code, $message, $description) {
    http_response_code($code);
    echo json_encode([
        "status" => [
            "code" => $code,
            "name" => $message,
            "description" => $description
        ]
    ]);
    exit;
}

if (!isset($_POST['lat']) || !isset($_POST['lon'])) {
    returnErrorResponse(400, "bad request", "Latitude and Longitude are required.");
}

$lat = $_POST['lat'];
$lon = $_POST['lon'];

if (!is_numeric($lat) || $lat < -90 || $lat > 90) {
    returnErrorResponse(400, "bad request", "Invalid latitude value.");
}

if (!is_numeric($lon) || $lon < -180 || $lon > 180) {
    returnErrorResponse(400, "bad request", "Invalid longitude value.");
}

$url = "https://api.openweathermap.org/data/2.5/forecast?lat={$lat}&lon={$lon}&appid={$apiKey}&units=metric";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    returnErrorResponse(500, "server error", "Curl error: " . curl_error($ch));
}

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 401) {
    returnErrorResponse(401, "unauthorized", "Invalid API key or unauthorized access.");
}

if ($httpCode !== 200) {
    returnErrorResponse($httpCode, "server error", "Received HTTP code " . $httpCode . " from OpenWeather API.");
}

if ($response === false) {
    returnErrorResponse(500, "server error", "Error retrieving data from OpenWeather API.");
}

$data = json_decode($response, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    returnErrorResponse(500, "server error", "JSON decode error: " . json_last_error_msg());
}

if (isset($data['list'])) {
    $forecastList = $data['list'];
    $forecast = [];
    
    $currentDate = new DateTime();
    for ($i = 0; $i < 4; $i++) {
        $currentDate->setTime(12, 0); 
        $closestTimeDiff = PHP_INT_MAX;
        $closestEntry = null;

        foreach ($forecastList as $entry) {
            $entryTime = DateTime::createFromFormat('U', $entry['dt']);
            $timeDiff = abs($entryTime->getTimestamp() - $currentDate->getTimestamp());

            if ($timeDiff < $closestTimeDiff) {
                $closestTimeDiff = $timeDiff;
                $closestEntry = $entry;
            }
        }

        if ($closestEntry) {
            $forecast[] = [
                "date" => $closestEntry['dt_txt'], 
                "conditionText" => $closestEntry['weather'][0]['description'],
                "conditionIcon" => "https://openweathermap.org/img/wn/" . $closestEntry['weather'][0]['icon'] . ".png",
                "minC" => round($closestEntry['main']['temp_min']),
                "maxC" => round($closestEntry['main']['temp_max'])
            ];
        }

        $currentDate->modify('+1 day'); 
    }

    $result = [
        "status" => [
            "code" => 200,
            "name" => "ok",
            "description" => "success"
        ],
        "data" => [
            "location" => $lat . ", " . $lon,
            "country" => "",
            "forecast" => $forecast,
            "lastUpdated" => date("Y-m-d H:i:s")
        ]
    ];

    echo json_encode($result);
} else {
    returnErrorResponse(500, "server error", "Unexpected response from OpenWeather API. Response: " . json_encode($data));
}
?>
