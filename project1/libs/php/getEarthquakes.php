<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

// URL для API запроса
$url = 'http://api.geonames.org/earthquakesJSON?';

// Задание координат для ограничения области поиска землетрясений
$north = $_REQUEST['north'];
$south = $_REQUEST['south'];
$east = $_REQUEST['east'];
$west = $_REQUEST['west'];

// Добавление параметров к URL запроса
$url .= 'north=' . $north . '&south=' . $south . '&east=' . $east . '&west=' . $west;

// Инициализация cURL сеанса
$ch = curl_init();
// Настройка параметров cURL
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

// Выполнение запроса и получение ответа
$result = curl_exec($ch);
error_log($result);

// Закрытие cURL сеанса
curl_close($ch);

// Декодирование полученных данных в формате JSON
$decode = json_decode($result, true);

// Формирование данных для ответа
$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $decode['earthquakes'];

// Установка заголовка ответа как JSON
header('Content-Type: application/json; charset=UTF-8');

// Возвращение JSON-ответа
echo json_encode($output); 
?>
