# Appointment Scheduler

## Introduction
Appointment Scheduler is a lightweight web application for managing clients, services, and appointments. It provides a simple CRUD interface (Create, Read, Update, Delete) for:
- Clients (people who book appointments)
- Services (offered items with duration and price)
- Appointments (bookings that link a client to a service at a specific date/time)

The app is implemented with a PHP + MySQL backend and a small vanilla JavaScript frontend. The purpose is to demonstrate a practical scheduling system with a responsive UI and a JSON API.

---

## Features
- Manage clients: add, update, delete clients.
- Manage services: add, update, delete services (prevents deletion while used by appointments).
- Manage appointments: create, list, update (status, time, notes, client/service), delete.
- Simple JSON API for all operations (used by the frontend).
- Client-side input validation and basic server-side validation.
- Database-level constraints (FKs, unique client+datetime).

---

## Database Design

ER diagram (textual / ASCII representation)

Clients (1) ───< Appointments >─── (1) Services

  [clients]           [appointments]               [services]
  ---------           --------------               ----------
  id (PK)     1    *  id (PK)                        id (PK)
  first_name ------< client_id (FK)                name
  last_name         service_id (FK) >------------* duration_minutes
  email             appointment_date               price
  phone             status
  created_at        notes
                    created_at

Notes:
- A client can have many appointments.
- A service can be used by many appointments.
- Appointments link exactly one client and one service.
- Appointments have a unique constraint on (client_id, appointment_date) to prevent double-booking the same client at the same time.

Table descriptions
- clients
  - id: INT AUTO_INCREMENT PRIMARY KEY
  - first_name, last_name: VARCHAR, required
  - email: VARCHAR, UNIQUE (optional)
  - phone: VARCHAR (optional)
  - created_at: TIMESTAMP

- services
  - id: INT AUTO_INCREMENT PRIMARY KEY
  - name: VARCHAR, required
  - duration_minutes: INT
  - price: DECIMAL(8,2)
  - created_at: TIMESTAMP

- appointments
  - id: INT AUTO_INCREMENT PRIMARY KEY
  - client_id: INT NOT NULL (FK → clients.id) ON DELETE CASCADE
  - service_id: INT NOT NULL (FK → services.id) ON DELETE RESTRICT
  - appointment_date: DATETIME NOT NULL
  - status: ENUM('scheduled','completed','cancelled') DEFAULT 'scheduled'
  - notes: TEXT
  - created_at: TIMESTAMP
  - UNIQUE KEY ux_client_datetime (client_id, appointment_date)

The database creation and sample data are in:
`appointment_scheduler/database.sql`

---

## Web Interface

Files of interest
- `appointment_scheduler/index.html` — Single-page UI for managing clients, services, and appointments.
- `appointment_scheduler/app.js` — Frontend logic: fetches data, posts JSON to backend, renders tables, opens modal for editing.
- `appointment_scheduler/*.php` — Backend endpoints (JSON) that the frontend calls.
  - add_client.php, update_client.php, delete_client.php
  - add_service.php, update_service.php, delete_service.php
  - add_appointment.php, update_appointment.php, delete_appointment.php
  - get_clients.php, get_services.php, get_appointments.php
  - db.php — shared DB connection and helper respond()
  - api.php — an additional multipurpose API (contains other example endpoints unrelated to scheduler)

Key pages / UI elements
- Booking panel (right column in index.html)
  - Select client, select service, pick date/time (datetime-local), optional notes, Add Appointment button.
- Clients / Services management (left column)
  - Add client/service forms and tables listing existing records with Edit and Delete actions.
- Appointments table
  - Shows client name, service name, date/time, status, notes, Edit and Delete buttons.
- Edit modal
  - Edit appointment details (client, service, datetime, status, notes)

API usage summary (JSON)
- GET `get_clients.php` — list clients
- POST `add_client.php` — add client (JSON: first_name, last_name, email, phone)
- POST `update_client.php` — update client (JSON: id, first_name?, last_name?, email?, phone?)
- POST `delete_client.php` — delete client (JSON: id)

- GET `get_services.php` — list services
- POST `add_service.php` — add service (JSON: name, duration_minutes, price)
- POST `update_service.php` — update service (JSON: id, name?, duration_minutes?, price?)
- POST `delete_service.php` — delete service (JSON: id)

- GET `get_appointments.php` — list appointments (supports optional GET filters: status, client_id, from, to)
- POST `add_appointment.php` — add appointment (JSON: client_id, service_id, appointment_date, notes)
- POST `update_appointment.php` — update appointment (JSON: id, appointment_date?, status?, notes?, client_id?, service_id?)
- POST `delete_appointment.php` — delete appointment (JSON: id)

---

## Setup

1. Create / import the database:
   - Edit `appointment_scheduler/database.sql` if you want to change DB/user names or passwords.
   - Import into MySQL:
     - mysql -u root -p < appointment_scheduler/database.sql
     - This creates the schema and sample data.

2. Configure environment variables or edit `appointment_scheduler/db.php`:
   - DB_HOST (default: localhost)
   - DB_NAME (default: appointment_scheduler)
   - DB_USER (default: root)
   - DB_PASS (default: empty string)
   - For production, set these as environment variables rather than editing files.

3. Place the `appointment_scheduler` folder on a PHP-enabled web server (e.g., Apache, Nginx+PHP-FPM). Ensure PHP has mysqli enabled.

4. Open `appointment_scheduler/index.html` in a browser (or navigate to it via webserver: http://localhost/appointment_scheduler/index.html).

Notes:
- CORS: `db.php` sets `Access-Control-Allow-Origin: *` to allow access when testing locally. Adjust for production.
- The sample DB creates a dedicated `appt_user` but by default `db.php` uses environment values; update them to use that user if desired.

---

## Challenges and Learning

What was challenging
- Handling date/time input across the client and server: HTML datetime-local uses "YYYY-MM-DDTHH:MM" while MySQL DATETIME expects "YYYY-MM-DD HH:MM:SS". The project normalizes formats on the server and client (app.js has helpers to convert).
- Preventing double-booking: a UNIQUE constraint on (client_id, appointment_date) was used to prevent a client from having two appointments at the exact same time. Handling that constraint gracefully (user-friendly errors) required checking SQL errors and returning meaningful messages.
- Referential integrity vs UX: Deleting a service that is used by appointments is restricted at the DB level (ON DELETE RESTRICT). UX must convey why a delete fails.

Insights and takeaways
- Keep server-side validation in addition to client-side checks — it prevents malformed or malicious data from corrupting the DB.
- Using prepared statements (mysqli->prepare / bind_param) reduces SQL injection risk and makes parameter handling more robust.
- Small projects benefit from a single-page JS frontend and a thin JSON API; it's simple to extend or replace the UI later (e.g., move to React/Vue).
- Explicit database constraints (FKs, unique keys) help maintain correct behavior even if front-end logic has bugs.

---

## Future improvements
- Add user authentication and role-based access control.
- Improve date/time handling: support time zones and avoid ambiguous local times.
- Prevent overlapping appointments for the same client during a service duration window (not just exact datetime equality).
- Add pagination, search, and better error/UI messages.
- Add unit/integration tests and CI checks.

---

If you want, I can:
- Add a quick curl examples section for each API endpoint.
- Add a Docker Compose file for local development (MySQL + PHP built-in server).
- Create a sequence diagram or a clickable ER diagram image for the README.

```