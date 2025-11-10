-- Add seat booking tracking table
CREATE TABLE seat_booking (
  seat_booking_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  show_id INT NOT NULL,
  seat_id VARCHAR(10) NOT NULL,
  status ENUM('booked','cancelled') DEFAULT 'booked',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_show_seat (show_id, seat_id, status),
  KEY idx_seat_booking_show (show_id),
  KEY idx_seat_booking_booking (booking_id),
  CONSTRAINT fk_seat_booking_booking FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE,
  CONSTRAINT fk_seat_booking_show FOREIGN KEY (show_id) REFERENCES showtime(show_id) ON DELETE CASCADE
);

-- Update booking triggers to handle seat_booking table
DELIMITER $$

-- Update the booking after insert trigger to handle seat bookings
DROP TRIGGER IF EXISTS trg_booking_after_insert$$
CREATE TRIGGER trg_booking_after_insert
AFTER INSERT ON booking FOR EACH ROW
BEGIN
  IF NEW.status = 'confirmed' THEN
    UPDATE showtime SET available_seats = available_seats - NEW.seats_booked
    WHERE show_id = NEW.show_id;
  END IF;
END$$

-- Update the booking after update trigger to handle seat bookings
DROP TRIGGER IF EXISTS trg_booking_after_update$$
CREATE TRIGGER trg_booking_after_update
AFTER UPDATE ON booking FOR EACH ROW
BEGIN
  IF OLD.status = 'confirmed' AND NEW.status IN ('cancelled','refunded') THEN
    UPDATE showtime SET available_seats = available_seats + OLD.seats_booked
    WHERE show_id = OLD.show_id;
    
    -- Cancel all seat bookings for this booking
    UPDATE seat_booking SET status = 'cancelled' 
    WHERE booking_id = NEW.booking_id;
  END IF;
END$$

DELIMITER ;