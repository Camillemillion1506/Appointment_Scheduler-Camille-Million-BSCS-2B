<?php
require_once 'db.php';
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) respond(['error' => 'Invalid JSON'], 400);

$id = intval($input['id'] ?? 0);
$first = isset($input['first_name']) ? trim($input['first_name']) : null;
$last = isset($input['last_name']) ? trim($input['last_name']) : null;
$email = isset($input['email']) ? trim($input['email']) : null;
$phone = isset($input['phone']) ? trim($input['phone']) : null;

if (!$id) respond(['error' => 'Missing id'], 400);

$sets = [];
$params = [];
$types = '';
if ($first !== null) { $sets[] = 'first_name = ?'; $types .= 's'; $params[] = $first; }
if ($last !== null)  { $sets[] = 'last_name = ?';  $types .= 's'; $params[] = $last; }
if ($email !== null) { 
    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) respond(['error' => 'Invalid email'], 400);
    $sets[] = 'email = ?'; $types .= 's'; $params[] = $email; 
}
if ($phone !== null) { $sets[] = 'phone = ?'; $types .= 's'; $params[] = $phone; }

if (empty($sets)) respond(['error' => 'Nothing to update'], 400);

$sql = "UPDATE clients SET " . implode(', ', $sets) . " WHERE id = ?";
$types .= 'i'; $params[] = $id;
$stmt = $mysqli->prepare($sql);
$stmt->bind_param($types, ...$params);
if ($stmt->execute()) respond(['success' => true, 'affected' => $stmt->affected_rows]);
respond(['error' => $stmt->error], 500);