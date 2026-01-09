<?php
require_once 'db.php';
$input = json_decode(file_get_contents('php://input'), true);
$id = intval($input['id'] ?? 0);
if (!$id) respond(['error' => 'Missing id'], 400);

// Prevent deleting a service that has appointments (FK is RESTRICT)
$stmt = $mysqli->prepare("DELETE FROM services WHERE id = ?");
$stmt->bind_param('i', $id);
if ($stmt->execute()) {
    if ($stmt->affected_rows === 0) {
        respond(['error' => 'Service not deleted. It may be used by existing appointments.'], 400);
    }
    respond(['success' => true]);
}
respond(['error' => $stmt->error], 500);