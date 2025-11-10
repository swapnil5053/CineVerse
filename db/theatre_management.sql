-- Theatre Management System - MySQL Schema, Seed, and Routines
-- Database: theatre_db

-- Safety
SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS theatre_db;
CREATE DATABASE theatre_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE theatre_db;

-- Tables
CREATE TABLE theatre (
  theatre_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(80) NOT NULL,
  contact_no VARCHAR(20),
  address VARCHAR(255) NOT NULL,
  UNIQUE KEY uq_theatre_name_city (name, city)
);

CREATE TABLE screen (
  screen_id INT AUTO_INCREMENT PRIMARY KEY,
  theatre_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  type ENUM('standard','imax','dolby','3d') DEFAULT 'standard',
  capacity INT NOT NULL CHECK (capacity > 0),
  status ENUM('active','inactive') DEFAULT 'active',
  UNIQUE KEY uq_screen_theatre_name (theatre_id, name),
  KEY idx_screen_theatre (theatre_id),
  CONSTRAINT fk_screen_theatre FOREIGN KEY (theatre_id) REFERENCES theatre(theatre_id) ON DELETE CASCADE
);

CREATE TABLE movie (
  movie_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  genre VARCHAR(60),
  language VARCHAR(40) DEFAULT 'English',
  rating DECIMAL(2,1),
  release_date DATE,
  status ENUM('now_showing','upcoming','archived') DEFAULT 'now_showing',
  FULLTEXT KEY ft_movie_title (title)
) ENGINE=InnoDB;

CREATE TABLE customer (
  cust_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  contact_no VARCHAR(20),
  membership_status ENUM('none','silver','gold') DEFAULT 'none',
  role ENUM('admin','customer') DEFAULT 'customer',
  password_hash VARCHAR(255) NOT NULL,
  UNIQUE KEY uq_customer_email (email)
);

CREATE TABLE staff (
  staff_id INT AUTO_INCREMENT PRIMARY KEY,
  theatre_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  role VARCHAR(60) NOT NULL,
  contact_no VARCHAR(20),
  salary DECIMAL(10,2) DEFAULT 0,
  KEY idx_staff_theatre (theatre_id),
  CONSTRAINT fk_staff_theatre FOREIGN KEY (theatre_id) REFERENCES theatre(theatre_id) ON DELETE CASCADE
);

CREATE TABLE screen_resource (
  resource_id INT AUTO_INCREMENT PRIMARY KEY,
  screen_id INT NOT NULL,
  type VARCHAR(60) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  status ENUM('available','maintenance','retired') DEFAULT 'available',
  KEY idx_resource_screen (screen_id),
  CONSTRAINT fk_resource_screen FOREIGN KEY (screen_id) REFERENCES screen(screen_id) ON DELETE CASCADE
);

CREATE TABLE showtime (
  show_id INT AUTO_INCREMENT PRIMARY KEY,
  screen_id INT NOT NULL,
  movie_id INT NOT NULL,
  show_date DATE NOT NULL,
  show_time TIME NOT NULL,
  price_type ENUM('standard','premium','vip') DEFAULT 'standard',
  base_price DECIMAL(10,2) NOT NULL DEFAULT 200.00,
  available_seats INT NOT NULL,
  UNIQUE KEY uq_showtime_slot (screen_id, show_date, show_time),
  KEY idx_showtime_screen (screen_id),
  KEY idx_showtime_movie (movie_id),
  CONSTRAINT fk_showtime_screen FOREIGN KEY (screen_id) REFERENCES screen(screen_id) ON DELETE CASCADE,
  CONSTRAINT fk_showtime_movie FOREIGN KEY (movie_id) REFERENCES movie(movie_id) ON DELETE RESTRICT
);

CREATE TABLE booking (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  cust_id INT NOT NULL,
  show_id INT NOT NULL,
  booking_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  seats_booked INT NOT NULL CHECK (seats_booked > 0),
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('card','upi','cash','netbanking') NOT NULL,
  status ENUM('confirmed','cancelled','refunded') NOT NULL DEFAULT 'confirmed',
  KEY idx_booking_customer (cust_id),
  KEY idx_booking_show (show_id),
  KEY idx_booking_time (booking_time),
  CONSTRAINT fk_booking_customer FOREIGN KEY (cust_id) REFERENCES customer(cust_id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_show FOREIGN KEY (show_id) REFERENCES showtime(show_id) ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS = 1;

-- Seed Data (DDL first, then DML: 6-10 rows per table where meaningful)
INSERT INTO theatre (name, city, contact_no, address) VALUES
('Galaxy Cinemas', 'Bengaluru', '080-1111111', 'MG Road, Bengaluru'),
('Starplex', 'Mumbai', '022-2222222', 'Bandra West, Mumbai'),
('CineHub', 'Pune', '020-3333333', 'FC Road, Pune');

INSERT INTO screen (theatre_id, name, type, capacity, status) VALUES
(1, 'Screen 1', 'standard', 120, 'active'),
(1, 'Screen 2', 'imax', 200, 'active'),
(1, 'Screen 3', '3d', 150, 'active'),
(2, 'Hall A', 'standard', 100, 'active'),
(2, 'Hall B', 'dolby', 180, 'active'),
(3, 'Auditorium 1', 'standard', 110, 'active'),
(3, 'Auditorium 2', 'dolby', 160, 'active');

INSERT INTO movie (title, duration_minutes, genre, language, rating, release_date, status) VALUES
('Skyfalling Stars', 130, 'Action', 'English', 8.1, DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'now_showing'),
('Masala Magic', 142, 'Drama', 'Hindi', 7.6, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'now_showing'),
('Ocean Whisper', 118, 'Romance', 'English', 7.2, DATE_SUB(CURDATE(), INTERVAL 40 DAY), 'now_showing'),
('Robo Run', 126, 'Sci-Fi', 'Hindi', 7.9, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'now_showing'),
('Future Quest', 150, 'Adventure', 'English', 8.4, DATE_ADD(CURDATE(), INTERVAL 20 DAY), 'upcoming');

INSERT INTO customer (name, email, contact_no, membership_status, password_hash) VALUES
('Aarav Mehta', 'aarav@example.com', '900000001', 'none', '$2b$12$placeholderhashA'),
('Diya Sharma', 'diya@example.com', '900000002', 'silver', '$2b$12$placeholderhashB'),
('Kabir Khan', 'kabir@example.com', '900000003', 'gold', '$2b$12$placeholderhashC'),
('Mira Patel', 'mira@example.com', '900000004', 'none', '$2b$12$placeholderhashD'),
('Rohan Gupta', 'rohan@example.com', '900000005', 'silver', '$2b$12$placeholderhashE'),
('Sara Ali', 'sara@example.com', '900000006', 'none', '$2b$12$placeholderhashF');

INSERT INTO staff (theatre_id, name, role, contact_no, salary) VALUES
(1, 'Nikhil Rao', 'Manager', '800111111', 60000.00),
(1, 'Priya Iyer', 'Cashier', '800111112', 30000.00),
(1, 'Vikram Das', 'Usher', '800111113', 20000.00),
(2, 'Ananya Roy', 'Manager', '800222221', 62000.00),
(2, 'Sanjay Kulkarni', 'Projectionist', '800222222', 35000.00);

INSERT INTO screen_resource (screen_id, type, quantity, status) VALUES
(1, 'Projector', 1, 'available'),
(1, 'Sound System', 1, 'available'),
(2, 'IMAX Projector', 1, 'available'),
(3, '3D Glasses', 200, 'available'),
(4, 'Seats', 100, 'available');

-- Initialize showtime (available_seats will be set by trigger to screen capacity)
INSERT INTO showtime (screen_id, movie_id, show_date, show_time, price_type, base_price, available_seats) VALUES
(1, 1, DATE_ADD(CURDATE(), INTERVAL 0 DAY), '10:00:00', 'standard', 220.00, 0),
(1, 2, DATE_ADD(CURDATE(), INTERVAL 0 DAY), '14:00:00', 'standard', 220.00, 0),
(2, 4, DATE_ADD(CURDATE(), INTERVAL 0 DAY), '18:30:00', 'premium', 350.00, 0),
(2, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '12:00:00', 'premium', 350.00, 0),
(3, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '16:00:00', 'standard', 250.00, 0),
(4, 2, DATE_ADD(CURDATE(), INTERVAL 0 DAY), '11:00:00', 'standard', 200.00, 0),
(5, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '20:00:00', 'vip', 450.00, 0),
(6, 5, DATE_ADD(CURDATE(), INTERVAL 0 DAY), '15:00:00', 'standard', 230.00, 0),
(6, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '19:00:00', 'premium', 320.00, 0),
(7, 2, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '13:30:00', 'standard', 210.00, 0),
(7, 1, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '21:15:00', 'vip', 480.00, 0);

-- Example bookings (some confirmed, some cancelled)
INSERT INTO booking (cust_id, show_id, seats_booked, total_amount, payment_method, status) VALUES
(1, 1, 2, 440.00, 'upi', 'confirmed'),
(2, 3, 3, 1050.00, 'card', 'confirmed'),
(3, 4, 1, 350.00, 'netbanking', 'cancelled');

-- Triggers
DELIMITER $$

-- Set available_seats to screen capacity when a showtime is inserted
CREATE TRIGGER trg_showtime_after_insert
AFTER INSERT ON showtime FOR EACH ROW
BEGIN
  DECLARE v_capacity INT;
  SELECT capacity INTO v_capacity FROM screen WHERE screen_id = NEW.screen_id;
  UPDATE showtime SET available_seats = v_capacity WHERE show_id = NEW.show_id;
END$$

-- Decrement seats after confirmed booking insert
CREATE TRIGGER trg_booking_after_insert
AFTER INSERT ON booking FOR EACH ROW
BEGIN
  IF NEW.status = 'confirmed' THEN
    UPDATE showtime SET available_seats = available_seats - NEW.seats_booked
    WHERE show_id = NEW.show_id;
  END IF;
END$$

-- Adjust seats on booking status change
CREATE TRIGGER trg_booking_after_update
AFTER UPDATE ON booking FOR EACH ROW
BEGIN
  IF OLD.status = 'confirmed' AND NEW.status IN ('cancelled','refunded') THEN
    UPDATE showtime SET available_seats = available_seats + OLD.seats_booked
    WHERE show_id = OLD.show_id;
  END IF;
END$$

-- Increment seats if a confirmed booking is deleted
CREATE TRIGGER trg_booking_after_delete
AFTER DELETE ON booking FOR EACH ROW
BEGIN
  IF OLD.status = 'confirmed' THEN
    UPDATE showtime SET available_seats = available_seats + OLD.seats_booked
    WHERE show_id = OLD.show_id;
  END IF;
END$$

-- Stored Procedures and Function

-- sp_book_ticket: transactional seat check and booking
CREATE PROCEDURE sp_book_ticket(
  IN p_cust_id INT,
  IN p_show_id INT,
  IN p_seats INT,
  IN p_payment_method ENUM('card','upi','cash','netbanking'),
  OUT p_booking_id INT,
  OUT p_error VARCHAR(255)
)
BEGIN
  main: BEGIN
    DECLARE v_available INT;
    DECLARE v_price DECIMAL(10,2);
    DECLARE v_total DECIMAL(10,2);
    DECLARE exit handler for SQLEXCEPTION
    BEGIN
      ROLLBACK;
      SET p_error = 'Database error while booking';
    END;

    SET p_error = NULL;
    SET p_booking_id = NULL;

    START TRANSACTION;
      -- Lock the showtime row for safe concurrent booking
      SELECT available_seats, base_price INTO v_available, v_price
      FROM showtime WHERE show_id = p_show_id FOR UPDATE;

      IF v_available IS NULL THEN
        SET p_error = 'Show not found';
        ROLLBACK; LEAVE main;
      END IF;

      IF p_seats <= 0 THEN
        SET p_error = 'Invalid seat count';
        ROLLBACK; LEAVE main;
      END IF;

      IF v_available < p_seats THEN
        SET p_error = 'Insufficient seats';
        ROLLBACK; LEAVE main;
      END IF;

      SET v_total = v_price * p_seats;

      INSERT INTO booking (cust_id, show_id, seats_booked, total_amount, payment_method, status)
      VALUES (p_cust_id, p_show_id, p_seats, v_total, p_payment_method, 'confirmed');

      SET p_booking_id = LAST_INSERT_ID();
      -- Seat decrement handled by trigger trg_booking_after_insert
    COMMIT;
  END main;
END$$

-- sp_get_total_revenue: sum revenue over a date range
CREATE PROCEDURE sp_get_total_revenue(
  IN p_start DATETIME,
  IN p_end DATETIME,
  OUT p_total DECIMAL(18,2)
)
BEGIN
  SELECT IFNULL(SUM(total_amount), 0) INTO p_total
  FROM booking
  WHERE status = 'confirmed' AND booking_time BETWEEN p_start AND p_end;
END$$

-- fn_show_revenue: revenue for a show_id
CREATE FUNCTION fn_show_revenue(p_show_id INT) RETURNS DECIMAL(18,2)
DETERMINISTIC
BEGIN
  DECLARE v_total DECIMAL(18,2);
  SELECT IFNULL(SUM(total_amount), 0) INTO v_total FROM booking WHERE status = 'confirmed' AND show_id = p_show_id;
  RETURN v_total;
END$$

DELIMITER ;

-- Views
CREATE OR REPLACE VIEW v_active_shows AS
SELECT s.show_id, t.theatre_id, t.name AS theatre_name, t.city,
       sc.screen_id, sc.name AS screen_name, sc.type AS screen_type,
       m.movie_id, m.title AS movie_title, m.genre, m.language,
       s.show_date, s.show_time, s.price_type, s.base_price, s.available_seats
FROM showtime s
JOIN screen sc ON sc.screen_id = s.screen_id AND sc.status = 'active'
JOIN theatre t ON t.theatre_id = sc.theatre_id
JOIN movie m ON m.movie_id = s.movie_id AND m.status = 'now_showing'
WHERE s.show_date >= CURDATE() AND s.available_seats > 0;

CREATE OR REPLACE VIEW v_theatre_revenue AS
SELECT t.theatre_id, t.name AS theatre_name, t.city,
       SUM(CASE WHEN b.status = 'confirmed' THEN b.total_amount ELSE 0 END) AS total_revenue,
       COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) AS confirmed_bookings
FROM theatre t
LEFT JOIN screen sc ON sc.theatre_id = t.theatre_id
LEFT JOIN showtime s ON s.screen_id = sc.screen_id
LEFT JOIN booking b ON b.show_id = s.show_id
GROUP BY t.theatre_id, t.name, t.city;

-- Indexes for performance tuning
CREATE INDEX idx_showtime_date ON showtime (show_date, show_time);
CREATE INDEX idx_movie_status ON movie (status);
CREATE INDEX idx_show_available ON showtime (available_seats);

-- Sample complex queries (reference)
-- 1) Top movies by revenue
-- SELECT m.title, SUM(b.total_amount) AS rev FROM booking b JOIN showtime s ON b.show_id=s.show_id JOIN movie m ON s.movie_id=m.movie_id WHERE b.status='confirmed' GROUP BY m.movie_id ORDER BY rev DESC LIMIT 5;
-- 2) Occupancy per show: (capacity - available)/capacity
-- SELECT s.show_id, (sc.capacity - s.available_seats)/sc.capacity AS occupancy FROM showtime s JOIN screen sc ON s.screen_id=sc.screen_id;
