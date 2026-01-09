<?php
require_once 'db.php';
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) respond(['error' => 'Invalid JSON'], 400);

$client_id = intval($input['client_id'] ?? 0);
$service_id = intval($input['service_id'] ?? 0);
$appointment_date_raw = trim($input['appointment_date'] ?? '');
$notes = trim($input['notes'] ?? '');

if (!$client_id || !$service_id || $appointment_date_raw === '') respond(['error' => 'Missing required fields'], 400);

// normalize datetime from input like '2026-01-10T09:00' or '2026-01-10 09:00'
$appointment_date = str_replace('T', ' ', $appointment_date_raw);
$appointment_date = preg_replace('/\.\d+$/','',$appointment_date); // strip milliseconds if any

// ensure client exists
$stmt = $mysqli->prepare("SELECT id FROM clients WHERE id = ?");
$stmt->bind_param('i', $client_id);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows === 0) respond(['error' => 'Client not found'], 400);
$stmt->close();

// ensure service exists
$stmt = $mysqli->prepare("SELECT id FROM services WHERE id = ?");
$stmt->bind_param('i', $service_id);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows === 0) respond(['error' => 'Service not found'], 400);
$stmt->close();

// Insert appointment (unique constraint prevents duplicate client+datetime)
$stmt = $mysqli->prepare("INSERT INTO appointments (client_id, service_id, appointment_date, notes) VALUES (?, ?, ?, ?)");
$stmt->bind_param('iiss', $client_id, $service_id, $appointment_date, $notes);
if ($stmt->execute()) {
    respond(['success' => true, 'id' => $stmt->insert_id]);
} else {
    // if unique constraint violation, inform user
    if (strpos($stmt->error, 'Duplicate') !== false || strpos($stmt->error, 'uniq') !== false) {
        respond(['error' => 'Client already has an appointment at that date/time'], 400);
    }
    respond(['error' => $stmt->error], 500);
}