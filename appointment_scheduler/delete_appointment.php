<?php
require_once 'db.php';
$input = json_decode(file_get_contents('php://input'), true);
$id = intval($input['id'] ?? 0);
if (!$id) respond(['error' => 'Missing id'], 400);

$stmt = $mysqli->prepare("DELETE FROM appointments WHERE id = ?");
$stmt->bind_param('i', $id);
if ($stmt->execute()) respond(['success' => true, 'affected' => $stmt->affected_rows]);
respond(['error' => $stmt->error], 500);