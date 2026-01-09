<?php
require_once 'db.php';
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) respond(['error' => 'Invalid JSON'], 400);

$first = trim($input['first_name'] ?? '');
$last = trim($input['last_name'] ?? '');
$email = trim($input['email'] ?? '');
$phone = trim($input['phone'] ?? '');

if ($first === '' || $last === '') respond(['error' => 'first_name and last_name are required'], 400);

// basic email validation if provided
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) respond(['error' => 'Invalid email'], 400);

$stmt = $mysqli->prepare("INSERT INTO clients (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)");
$stmt->bind_param('ssss', $first, $last, $email, $phone);
if ($stmt->execute()) {
    respond(['success' => true, 'id' => $stmt->insert_id]);
} else {
    // duplicate email handling
    respond(['error' => $stmt->error], 500);
}