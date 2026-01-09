-- Appointment Scheduler: database and sample data
-- UPDATED: Remove explicit FLUSH PRIVILEGES (may fail for non-privileged users).
-- IMPORTANT: Replace 'YourStrongPasswordHere!' with a secure password before use.

DROP DATABASE IF EXISTS appointment_scheduler;
CREATE DATABASE appointment_scheduler DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE appointment_scheduler;

-- clients table
CREATE TABLE clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE,
  phone VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- services table
CREATE TABLE services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 30,
  price DECIMAL(8,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- appointments table
CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  service_id INT NOT NULL,
  appointment_date DATETIME NOT NULL,
  status ENUM('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
  UNIQUE KEY ux_client_datetime (client_id, appointment_date)
) ENGINE=InnoDB;

-- Sample data
INSERT INTO clients (first_name, last_name, email, phone) VALUES
('Alice','Garcia','alice@example.com','09171234567'),
('Ben','Lopez','ben@example.com','09179876543'),
('Carla','Reyes','carla@example.net','09170001111');

INSERT INTO services (name, duration_minutes, price) VALUES
('Consultation',30,20.00),
('Therapy Session',60,50.00),
('Follow-up',45,35.00),
('Vaccination',15,10.00);

INSERT INTO appointments (client_id, service_id, appointment_date, status, notes) VALUES
(1,1,'2026-01-10 09:00:00','scheduled','Needs special seating'),
(2,2,'2026-01-11 11:30:00','scheduled','First-time visit');

-- Create a dedicated database user with limited privileges.
-- Replace the password with a strong secret.
-- Create user for localhost (socket) and for all hosts (%) to allow remote connections.
CREATE USER IF NOT EXISTS 'appt_user'@'localhost' IDENTIFIED BY 'YourStrongPasswordHere!';
CREATE USER IF NOT EXISTS 'appt_user'@'%' IDENTIFIED BY 'YourStrongPasswordHere!';

-- Grant only the needed privileges on the appointment_scheduler database.
GRANT SELECT, INSERT, UPDATE, DELETE ON appointment_scheduler.* TO 'appt_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON appointment_scheduler.* TO 'appt_user'@'%';

-- Note: GRANT implicitly reloads privilege tables; explicit FLUSH PRIVILEGES is not required and
-- can fail if the executing account lacks the RELOAD privilege.
-- If you do want to run FLUSH PRIVILEGES, run it as a user with RELOAD privilege (e.g. root).

-- Helpful example queries included for the report
-- SELECT a.*, c.first_name, c.last_name, s.name AS service_name FROM appointments a
-- JOIN clients c ON a.client_id = c.id
-- JOIN services s ON a.service_id = s.id;