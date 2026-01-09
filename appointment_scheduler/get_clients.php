<?php
require_once 'db.php';
$result = $mysqli->query("SELECT id, first_name, last_name, email, phone, created_at FROM clients ORDER BY first_name, last_name");
$rows = [];
while ($r = $result->fetch_assoc()) $rows[] = $r;
respond($rows);