-- ============================================================================
-- CineVerse - Complete SQL Queries Collection
-- All queries used in the project categorized by type
-- ============================================================================

USE theatre_db;

-- ============================================================================
-- 1. DDL (Data Definition Language) - CREATE TABLE Statements
-- ============================================================================

-- Already in theatre_management.sql, but key tables shown here:

CREATE TABLE IF NOT EXISTS theatre (
  theatre_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(80) NOT NULL,
  contact_no VARCHAR(20),
  address VARCHAR(255) NOT NULL,
  UNIQUE KEY uq_theatre_name_city (name, city)
);

CREATE TABLE IF NOT EXISTS screen (
  screen_id INT AUTO_INCREMENT PRIMARY KEY,
  theatre_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  type ENUM('standard','imax','dolby','3d') DEFAULT 'standard',
  capacity INT NOT NULL CHECK (capacity > 0),
  status ENUM('active','inactive') DEFAULT 'active',
  UNIQUE KEY uq_screen_theatre_name (theatre_id, name),
  CONSTRAINT fk_screen_theatre FOREIGN KEY (theatre_id) REFERENCES theatre(theatre_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS movie (
  movie_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  genre VARCHAR(60),
  language VARCHAR(40) DEFAULT 'English',
  rating DECIMAL(2,1),
  release_date DATE,
  status ENUM('now_showing','upcoming','archived') DEFAULT 'now_showing'
);

CREATE TABLE IF NOT EXISTS customer (
  cust_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  contact_no VARCHAR(20),
  membership_status ENUM('none','silver','gold') DEFAULT 'none',
  role ENUM('admin','customer') DEFAULT 'customer',
  password_hash VARCHAR(255) NOT NULL,
  UNIQUE KEY uq_customer_email (email)
);

CREATE TABLE IF NOT EXISTS showtime (
  show_id INT AUTO_INCREMENT PRIMARY KEY,
  screen_id INT NOT NULL,
  movie_id INT NOT NULL,
  show_date DATE NOT NULL,
  show_time TIME NOT NULL,
  price_type ENUM('standard','premium','vip') DEFAULT 'standard',
  base_price DECIMAL(10,2) NOT NULL DEFAULT 200.00,
  available_seats INT NOT NULL,
  UNIQUE KEY uq_showtime_slot (screen_id, show_date, show_time),
  CONSTRAINT fk_showtime_screen FOREIGN KEY (screen_id) REFERENCES screen(screen_id) ON DELETE CASCADE,
  CONSTRAINT fk_showtime_movie FOREIGN KEY (movie_id) REFERENCES movie(movie_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS booking (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  cust_id INT NOT NULL,
  show_id INT NOT NULL,
  booking_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  seats_booked INT NOT NULL CHECK (seats_booked > 0),
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('card','upi','cash','netbanking') NOT NULL,
  status ENUM('confirmed','cancelled','refunded') NOT NULL DEFAULT 'confirmed',
  CONSTRAINT fk_booking_customer FOREIGN KEY (cust_id) REFERENCES customer(cust_id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_show FOREIGN KEY (show_id) REFERENCES showtime(show_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS seat_booking (
  seat_booking_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  show_id INT NOT NULL,
  seat_id VARCHAR(10) NOT NULL,
  status ENUM('booked','cancelled') DEFAULT 'booked',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_show_seat (show_id, seat_id, status),
  CONSTRAINT fk_seat_booking_booking FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE,
  CONSTRAINT fk_seat_booking_show FOREIGN KEY (show_id) REFERENCES showtime(show_id) ON DELETE CASCADE
);

-- ============================================================================
-- 2. DML (Data Manipulation Language) - INSERT Statements
-- ============================================================================

-- Insert theatres
INSERT INTO theatre (name, city, contact_no, address) VALUES
('Galaxy Cinemas', 'Bengaluru', '080-1111111', 'MG Road, Bengaluru'),
('Starplex', 'Mumbai', '022-2222222', 'Bandra West, Mumbai'),
('CineHub', 'Pune', '020-3333333', 'FC Road, Pune');

-- Insert screens
INSERT INTO screen (theatre_id, name, type, capacity, status) VALUES
(1, 'Screen 1', 'standard', 120, 'active'),
(1, 'Screen 2', 'imax', 200, 'active'),
(1, 'Screen 3', '3d', 150, 'active');

-- Insert movies
INSERT INTO movie (title, duration_minutes, genre, language, rating, release_date, status) VALUES
('Skyfalling Stars', 130, 'Action', 'English', 8.1, '2025-10-17', 'now_showing'),
('Masala Magic', 142, 'Drama', 'Hindi', 7.6, '2025-10-27', 'now_showing');

-- ============================================================================
-- 3. TRIGGERS
-- ============================================================================

-- Trigger 1: Decrement seats after booking
DELIMITER $$
CREATE TRIGGER trg_booking_after_insert
AFTER INSERT ON booking FOR EACH ROW
BEGIN
  IF NEW.status = 'confirmed' THEN
    UPDATE showtime SET available_seats = available_seats - NEW.seats_booked
    WHERE show_id = NEW.show_id;
  END IF;
END$$
DELIMITER ;

-- Trigger 2: Restore seats on cancellation
DELIMITER $$
CREATE TRIGGER trg_booking_after_update
AFTER UPDATE ON booking FOR EACH ROW
BEGIN
  IF OLD.status = 'confirmed' AND NEW.status IN ('cancelled','refunded') THEN
    UPDATE showtime SET available_seats = available_seats + OLD.seats_booked
    WHERE show_id = OLD.show_id;
    
    UPDATE seat_booking SET status = 'cancelled' 
    WHERE booking_id = NEW.booking_id;
  END IF;
END$$
DELIMITER ;

-- Trigger 3: Restore seats on booking deletion
DELIMITER $$
CREATE TRIGGER trg_booking_after_delete
AFTER DELETE ON booking FOR EACH ROW
BEGIN
  IF OLD.status = 'confirmed' THEN
    UPDATE showtime SET available_seats = available_seats + OLD.seats_booked
    WHERE show_id = OLD.show_id;
  END IF;
END$$
DELIMITER ;

-- ============================================================================
-- 4. STORED PROCEDURES
-- ============================================================================

-- Procedure 1: Book ticket with transaction safety
DELIMITER $$
CREATE PROCEDURE sp_book_ticket(
  IN p_cust_id INT,
  IN p_show_id INT,
  IN p_seats INT,
  IN p_payment_method ENUM('card','upi','cash','netbanking'),
  OUT p_booking_id INT,
  OUT p_error VARCHAR(255)
)
BEGIN
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
    SELECT available_seats, base_price INTO v_available, v_price
    FROM showtime WHERE show_id = p_show_id FOR UPDATE;

    IF v_available IS NULL THEN
      SET p_error = 'Show not found';
      ROLLBACK;
    ELSEIF p_seats <= 0 THEN
      SET p_error = 'Invalid seat count';
      ROLLBACK;
    ELSEIF v_available < p_seats THEN
      SET p_error = 'Insufficient seats';
      ROLLBACK;
    ELSE
      SET v_total = v_price * p_seats;
      INSERT INTO booking (cust_id, show_id, seats_booked, total_amount, payment_method, status)
      VALUES (p_cust_id, p_show_id, p_seats, v_total, p_payment_method, 'confirmed');
      SET p_booking_id = LAST_INSERT_ID();
      COMMIT;
    END IF;
END$$
DELIMITER ;

-- Procedure 2: Get total revenue for date range
DELIMITER $$
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
DELIMITER ;

-- ============================================================================
-- 5. FUNCTIONS
-- ============================================================================

-- Function: Calculate revenue for a specific show
DELIMITER $$
CREATE FUNCTION fn_show_revenue(p_show_id INT) RETURNS DECIMAL(18,2)
DETERMINISTIC
BEGIN
  DECLARE v_total DECIMAL(18,2);
  SELECT IFNULL(SUM(total_amount), 0) INTO v_total 
  FROM booking 
  WHERE status = 'confirmed' AND show_id = p_show_id;
  RETURN v_total;
END$$
DELIMITER ;

-- ============================================================================
-- 6. VIEWS
-- ============================================================================

-- View 1: Active shows with complete details
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

-- View 2: Theatre revenue summary
CREATE OR REPLACE VIEW v_theatre_revenue AS
SELECT t.theatre_id, t.name AS theatre_name, t.city,
       SUM(CASE WHEN b.status = 'confirmed' THEN b.total_amount ELSE 0 END) AS total_revenue,
       COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) AS confirmed_bookings
FROM theatre t
LEFT JOIN screen sc ON sc.theatre_id = t.theatre_id
LEFT JOIN showtime s ON s.screen_id = sc.screen_id
LEFT JOIN booking b ON b.show_id = s.show_id
GROUP BY t.theatre_id, t.name, t.city;

-- ============================================================================
-- 7. NESTED QUERIES
-- ============================================================================

-- Nested Query 1: Customers who booked the top revenue movie
SELECT DISTINCT c.cust_id, c.name, c.email
FROM customer c
JOIN booking b ON b.cust_id = c.cust_id AND b.status='confirmed'
JOIN showtime s ON s.show_id = b.show_id
WHERE s.movie_id = (
  SELECT movie_id FROM (
    SELECT s2.movie_id, SUM(b2.total_amount) AS rev
    FROM booking b2
    JOIN showtime s2 ON s2.show_id = b2.show_id
    WHERE b2.status='confirmed'
    GROUP BY s2.movie_id
    ORDER BY rev DESC
    LIMIT 1
  ) AS top_movie
)
ORDER BY c.name;

-- Nested Query 2: Shows with above-average pricing
SELECT show_id, movie_id, show_date, show_time, base_price
FROM showtime
WHERE base_price > (SELECT AVG(base_price) FROM showtime)
ORDER BY base_price DESC;

-- Nested Query 3: Theatres with most bookings
SELECT t.name, t.city,
       (SELECT COUNT(*) FROM booking b
        JOIN showtime s ON b.show_id = s.show_id
        JOIN screen sc ON s.screen_id = sc.screen_id
        WHERE sc.theatre_id = t.theatre_id AND b.status = 'confirmed') AS total_bookings
FROM theatre t
ORDER BY total_bookings DESC;

-- ============================================================================
-- 8. JOIN QUERIES
-- ============================================================================

-- Join Query 1: Complete booking details (5-table join)
SELECT b.booking_id,
       c.name AS customer_name,
       c.email,
       m.title AS movie,
       t.name AS theatre,
       sc.name AS screen,
       s.show_date,
       s.show_time,
       b.seats_booked,
       b.total_amount,
       b.payment_method,
       b.status
FROM booking b
JOIN customer c ON b.cust_id = c.cust_id
JOIN showtime s ON b.show_id = s.show_id
JOIN movie m ON s.movie_id = m.movie_id
JOIN screen sc ON s.screen_id = sc.screen_id
JOIN theatre t ON sc.theatre_id = t.theatre_id
WHERE b.status = 'confirmed'
ORDER BY b.booking_time DESC;

-- Join Query 2: Shows with theatre and movie details
SELECT s.show_id,
       m.title AS movie,
       m.genre,
       m.language,
       t.name AS theatre,
       t.city,
       sc.name AS screen,
       sc.type AS screen_type,
       s.show_date,
       s.show_time,
       s.base_price,
       s.available_seats
FROM showtime s
INNER JOIN movie m ON s.movie_id = m.movie_id
INNER JOIN screen sc ON s.screen_id = sc.screen_id
INNER JOIN theatre t ON sc.theatre_id = t.theatre_id
WHERE s.show_date >= CURDATE()
ORDER BY s.show_date, s.show_time;

-- Join Query 3: Customer booking history with seat details
SELECT c.name AS customer,
       b.booking_id,
       m.title AS movie,
       s.show_date,
       s.show_time,
       GROUP_CONCAT(sb.seat_id ORDER BY sb.seat_id) AS seats,
       b.total_amount
FROM customer c
JOIN booking b ON c.cust_id = b.cust_id
JOIN showtime s ON b.show_id = s.show_id
JOIN movie m ON s.movie_id = m.movie_id
LEFT JOIN seat_booking sb ON b.booking_id = sb.booking_id AND sb.status = 'booked'
WHERE b.status = 'confirmed'
GROUP BY c.cust_id, b.booking_id, m.title, s.show_date, s.show_time, b.total_amount
ORDER BY b.booking_time DESC;

-- ============================================================================
-- 9. AGGREGATE QUERIES
-- ============================================================================

-- Aggregate Query 1: Theatre performance analysis
SELECT t.name AS theatre,
       t.city,
       COUNT(DISTINCT sc.screen_id) AS total_screens,
       COUNT(DISTINCT s.show_id) AS total_shows,
       COUNT(b.booking_id) AS total_bookings,
       SUM(b.seats_booked) AS total_seats_sold,
       SUM(b.total_amount) AS total_revenue,
       AVG(b.total_amount) AS avg_booking_value
FROM theatre t
LEFT JOIN screen sc ON t.theatre_id = sc.theatre_id
LEFT JOIN showtime s ON sc.screen_id = s.screen_id
LEFT JOIN booking b ON s.show_id = b.show_id AND b.status = 'confirmed'
GROUP BY t.theatre_id, t.name, t.city
ORDER BY total_revenue DESC;

-- Aggregate Query 2: Movie popularity and revenue
SELECT m.title,
       m.genre,
       COUNT(DISTINCT s.show_id) AS total_shows,
       COUNT(b.booking_id) AS total_bookings,
       SUM(b.seats_booked) AS total_tickets_sold,
       SUM(b.total_amount) AS total_revenue,
       AVG(b.total_amount) AS avg_booking_value,
       MAX(b.total_amount) AS max_booking_value
FROM movie m
LEFT JOIN showtime s ON m.movie_id = s.movie_id
LEFT JOIN booking b ON s.show_id = b.show_id AND b.status = 'confirmed'
GROUP BY m.movie_id, m.title, m.genre
HAVING total_bookings > 0
ORDER BY total_revenue DESC;

-- Aggregate Query 3: Daily revenue analysis
SELECT DATE(booking_time) AS booking_date,
       COUNT(booking_id) AS total_bookings,
       SUM(seats_booked) AS total_seats,
       SUM(total_amount) AS daily_revenue,
       AVG(total_amount) AS avg_booking_value,
       MIN(total_amount) AS min_booking,
       MAX(total_amount) AS max_booking
FROM booking
WHERE status = 'confirmed'
GROUP BY DATE(booking_time)
ORDER BY booking_date DESC;

-- Aggregate Query 4: Screen utilization analysis
SELECT sc.name AS screen,
       t.name AS theatre,
       sc.capacity,
       COUNT(s.show_id) AS total_shows,
       SUM(sc.capacity - s.available_seats) AS seats_sold,
       SUM(sc.capacity) AS total_capacity,
       ROUND((SUM(sc.capacity - s.available_seats) / SUM(sc.capacity)) * 100, 2) AS occupancy_rate
FROM screen sc
JOIN theatre t ON sc.theatre_id = t.theatre_id
LEFT JOIN showtime s ON sc.screen_id = s.screen_id
GROUP BY sc.screen_id, sc.name, t.name, sc.capacity
ORDER BY occupancy_rate DESC;

-- ============================================================================
-- 10. COMPLEX ANALYTICAL QUERIES
-- ============================================================================

-- Query 1: Top 5 customers by spending
SELECT c.name,
       c.email,
       c.membership_status,
       COUNT(b.booking_id) AS total_bookings,
       SUM(b.seats_booked) AS total_tickets,
       SUM(b.total_amount) AS total_spent,
       AVG(b.total_amount) AS avg_per_booking
FROM customer c
JOIN booking b ON c.cust_id = b.cust_id
WHERE b.status = 'confirmed'
GROUP BY c.cust_id, c.name, c.email, c.membership_status
ORDER BY total_spent DESC
LIMIT 5;

-- Query 2: Peak booking hours
SELECT HOUR(booking_time) AS hour_of_day,
       COUNT(*) AS bookings_count,
       SUM(total_amount) AS revenue
FROM booking
WHERE status = 'confirmed'
GROUP BY HOUR(booking_time)
ORDER BY bookings_count DESC;

-- Query 3: Genre performance analysis
SELECT m.genre,
       COUNT(DISTINCT m.movie_id) AS movies_count,
       COUNT(DISTINCT s.show_id) AS shows_count,
       COUNT(b.booking_id) AS bookings_count,
       SUM(b.total_amount) AS total_revenue
FROM movie m
LEFT JOIN showtime s ON m.movie_id = s.movie_id
LEFT JOIN booking b ON s.show_id = b.show_id AND b.status = 'confirmed'
GROUP BY m.genre
ORDER BY total_revenue DESC;

-- ============================================================================
-- 11. UPDATE QUERIES
-- ============================================================================

-- Update movie rating
UPDATE movie 
SET rating = 8.5 
WHERE title = 'Skyfalling Stars';

-- Update customer membership
UPDATE customer 
SET membership_status = 'silver' 
WHERE cust_id = 1;

-- Update show pricing
UPDATE showtime 
SET base_price = base_price * 1.1 
WHERE show_date >= '2026-01-01';

-- ============================================================================
-- 12. DELETE QUERIES
-- ============================================================================

-- Delete cancelled bookings older than 30 days
DELETE FROM booking 
WHERE status = 'cancelled' 
AND booking_time < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Delete archived movies
DELETE FROM movie 
WHERE status = 'archived' 
AND release_date < DATE_SUB(CURDATE(), INTERVAL 1 YEAR);

-- ============================================================================
-- 13. UTILITY QUERIES
-- ============================================================================

-- Check database size
SELECT 
    table_schema AS 'Database',
    SUM(data_length + index_length) / 1024 / 1024 AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'theatre_db'
GROUP BY table_schema;

-- Show table row counts
SELECT 
    table_name AS 'Table',
    table_rows AS 'Rows'
FROM information_schema.tables
WHERE table_schema = 'theatre_db'
ORDER BY table_rows DESC;

-- Show all indexes
SELECT 
    table_name AS 'Table',
    index_name AS 'Index',
    column_name AS 'Column'
FROM information_schema.statistics
WHERE table_schema = 'theatre_db'
ORDER BY table_name, index_name;
