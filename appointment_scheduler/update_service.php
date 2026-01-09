<?php
require_once 'db.php';
$input = json_decode(file_get_contents('php://input'), true);
$id = intval($input['id'] ?? 0);
$name = isset($input['name']) ? trim($input['name']) : null;
$duration = isset($input['duration_minutes']) ? intval($input['duration_minutes']) : null;
$price = isset($input['price']) ? (is_numeric($input['price']) ? number_format((float)$input['price'],2,'.','') : null) : null;

if (!$id) respond(['error' => 'Missing id'], 400);
$sets = []; $params = []; $types = '';
if ($name !== null) { $sets[] = 'name = ?'; $types .= 's'; $params[] = $name; }
if ($duration !== null) { $sets[] = 'duration_minutes = ?'; $types .= 'i'; $params[] = $duration; }
if ($price !== null) { $sets[] = 'price = ?'; $types .= 's'; $params[] = $price; }
if (empty($sets)) respond(['error' => 'Nothing to update'], 400);

$sql = "UPDATE services SET " . implode(', ', $sets) . " WHERE id = ?";
$types .= 'i'; $params[] = $id;
$stmt = $mysqli->prepare($sql);
$stmt->bind_param($types, ...$params);
if ($stmt->execute()) respond(['success' => true, 'affected' => $stmt->affected_rows]);
respond(['error' => $stmt->error], 500);