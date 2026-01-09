<?php
require_once 'db.php';
$result = $mysqli->query("SELECT id, name, duration_minutes, price, created_at FROM services ORDER BY name");
$rows = [];
while ($r = $result->fetch_assoc()) $rows[] = $r;
respond($rows);