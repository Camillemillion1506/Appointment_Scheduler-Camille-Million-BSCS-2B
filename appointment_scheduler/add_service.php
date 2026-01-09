<?php
require_once 'db.php';
$input = json_decode(file_get_contents('php://input'), true);
$name = trim($input['name'] ?? '');
$duration = intval($input['duration_minutes'] ?? 30);
$price = is_numeric($input['price'] ?? null) ? number_format((float)$input['price'], 2, '.', '') : '0.00';

if ($name === '') respond(['error' => 'Service name required'], 400);
if ($duration <= 0) respond(['error' => 'Invalid duration'], 400);

$stmt = $mysqli->prepare("INSERT INTO services (name, duration_minutes, price) VALUES (?, ?, ?)");
$stmt->bind_param('sis', $name, $duration, $price);
if ($stmt->execute()) respond(['success' => true, 'id' => $stmt->insert_id]);
respond(['error' => $stmt->error], 500);