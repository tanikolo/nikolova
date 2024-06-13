<?php
$host_name = 'db5015939957.hosting-data.io';
$database = 'dbs12991741';
$user_name = 'dbu2677101';
$password = 'R@inb0wd@y2024';

$link = new mysqli($host_name, $user_name, $password, $database);

if ($link->connect_error) {
    die('<p>Failed to connect to MySQL: '. $link->connect_error .'</p>');
}
?>
