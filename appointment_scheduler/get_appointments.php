<?php
require_once 'db.php';

// optional filtering: status, client_id, from/to dates
$params = [];
$where = [];

if (isset($_GET['status']) && $_GET['status'] !== '') {
    $status = $mysqli->real_escape_string($_GET['status']);
    $where[] = "a.status = '{$status}'";
}
if (isset($_GET['client_id']) && $_GET['client_id'] !== '') {
    $client_id = intval($_GET['client_id']);
    $where[] = "a.client_id = {$client_id}";
}
if (isset($_GET['from']) && $_GET['from'] !== '') {
    $from = $mysqli->real_escape_string($_GET['from']);
    $where[] = "a.appointment_date >= '{$from}'";
}
if (isset($_GET['to']) && $_GET['to'] !== '') {
    $to = $mysqli->real_escape_string($_GET['to']);
    $where[] = "a.appointment_date <= '{$to}'";
}

$sql = "SELECT a.id, a.appointment_date, a.status, a.notes, a.created_at,
               c.id AS client_id, c.first_name, c.last_name, c.email, c.phone,
               s.id AS service_id, s.name AS service_name, s.duration_minutes, s.price
        FROM appointments a
        JOIN clients c ON a.client_id = c.id
        JOIN services s ON a.service_id = s.id";

if (!empty($where)) $sql .= " WHERE " . implode(' AND ', $where);

$sql .= " ORDER BY a.appointment_date ASC";

$res = $mysqli->query($sql);
$rows = [];
while ($r = $res->fetch_assoc()) $rows[] = $r;
respond($rows);