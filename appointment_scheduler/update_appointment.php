<?php
require_once 'db.php';
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) respond(['error' => 'Invalid JSON'], 400);

$id = intval($input['id'] ?? 0);
if (!$id) respond(['error' => 'Missing id'], 400);

$status = isset($input['status']) ? $mysqli->real_escape_string($input['status']) : null;
$appointment_date = isset($input['appointment_date']) ? str_replace('T',' ',$input['appointment_date']) : null;
$notes = isset($input['notes']) ? $input['notes'] : null;
$service_id = isset($input['service_id']) ? intval($input['service_id']) : null;
$client_id = isset($input['client_id']) ? intval($input['client_id']) : null;

$sets = []; $params = []; $types = '';
if ($status !== null) { $sets[] = 'status = ?'; $types .= 's'; $params[] = $status; }
if ($appointment_date !== null) { $sets[] = 'appointment_date = ?'; $types .= 's'; $params[] = $appointment_date; }
if ($notes !== null) { $sets[] = 'notes = ?'; $types .= 's'; $params[] = $notes; }
if ($service_id !== null) { $sets[] = 'service_id = ?'; $types .= 'i'; $params[] = $service_id; }
if ($client_id !== null) { $sets[] = 'client_id = ?'; $types .= 'i'; $params[] = $client_id; }

if (empty($sets)) respond(['error' => 'Nothing to update'], 400);

$sql = "UPDATE appointments SET " . implode(', ', $sets) . " WHERE id = ?";
$types .= 'i'; $params[] = $id;
$stmt = $mysqli->prepare($sql);
$stmt->bind_param($types, ...$params);
if ($stmt->execute()) {
    respond(['success' => true, 'affected' => $stmt->affected_rows]);
} else {
    // handle unique constraint conflict
    if (strpos($stmt->error, 'Duplicate') !== false) respond(['error' => 'Client already has an appointment at that date/time'], 400);
    respond(['error' => $stmt->error], 500);
}