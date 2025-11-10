# 🎬 CineVerse - Live Demo Guide

## Demo Flow for DBMS Project Presentation

### Part 1: Show Database Structure (2 minutes)

```sql
-- Show all tables
USE theatre_db;
SHOW TABLES;

-- Show table structures
DESCRIBE theatre;
DESCRIBE screen;
DESCRIBE movie;
DESCRIBE customer;
DESCRIBE showtime;
DESCRIBE booking;
DESCRIBE seat_booking;
DESCRIBE staff;
DESCRIBE screen_resource;
```

---

### Part 2: Demonstrate CRUD Operations (5 minutes)

#### CREATE - Add a new movie
```sql
-- Before: Check current movies
SELECT COUNT(*) as total_movies FROM movie;

-- CREATE: Insert new movie
INSERT INTO movie (title, duration_minutes, genre, language, rating, release_date, status)
VALUES ('Demo Movie', 135, 'Action', 'English', 8.5, '2026-06-01', 'upcoming');

-- After: Verify insertion
SELECT * FROM movie WHERE title = 'Demo Movie';
SELECT COUNT(*) as total_movies FROM movie;
```

#### READ - Query shows with filters
```sql
-- Read all shows for a specific date
SELECT s.show_id, m.title, t.name as theatre, sc.name as screen,
       s.show_date, s.show_time, s.available_seats, s.base_price
FROM showtime s
JOIN movie m ON s.movie_id = m.movie_id
JOIN screen sc ON s.screen_id = sc.screen_id
JOIN theatre t ON sc.theatre_id = t.theatre_id
WHERE s.show_date = '2025-12-01'
ORDER BY s.show_time;
```

#### UPDATE - Modify movie rating
```sql
-- Before: Check current rating
SELECT title, rating FROM movie WHERE title = 'Demo Movie';

-- UPDATE: Change rating
UPDATE movie SET rating = 9.0 WHERE title = 'Demo Movie';

-- After: Verify update
SELECT title, rating FROM movie WHERE title = 'Demo Movie';
```

#### DELETE - Remove the demo movie
```sql
-- Before: Verify movie exists
SELECT movie_id, title FROM movie WHERE title = 'Demo Movie';

-- DELETE: Remove movie
DELETE FROM movie WHERE title = 'Demo Movie';

-- After: Verify deletion
SELECT COUNT(*) as total_movies FROM movie;
```

---

### Part 3: Demonstrate Triggers (5 minutes)

#### Trigger 1: Automatic Seat Decrement on Booking

```sql
-- Step 1: Check current available seats for a show
SELECT show_id, show_date, show_time, available_seats 
FROM showtime 
WHERE show_id = 1;

-- Step 2: Create a test booking (trigger will fire automatically)
INSERT INTO booking (cust_id, show_id, seats_booked, total_amount, payment_method, status)
VALUES (1, 1, 3, 660.00, 'upi', 'confirmed');

-- Step 3: Check seats after booking (should be reduced by 3)
SELECT show_id, show_date, show_time, available_seats 
FROM showtime 
WHERE show_id = 1;

-- Explanation: The trigger 'trg_booking_after_insert' automatically reduced available_seats
```

#### Trigger 2: Seat Restoration on Booking Cancellation

```sql
-- Step 1: Get the booking we just created
SELECT booking_id, show_id, seats_booked, status 
FROM booking 
WHERE show_id = 1 
ORDER BY booking_id DESC 
LIMIT 1;

-- Step 2: Check current available seats
SELECT show_id, available_seats FROM showtime WHERE show_id = 1;

-- Step 3: Cancel the booking (trigger will fire)
UPDATE booking 
SET status = 'cancelled' 
WHERE booking_id = (SELECT MAX(booking_id) FROM (SELECT booking_id FROM booking WHERE show_id = 1) as temp);

-- Step 4: Check seats after cancellation (should be restored)
SELECT show_id, available_seats FROM showtime WHERE show_id = 1;

-- Explanation: The trigger 'trg_booking_after_update' automatically restored the seats
```

#### Show All Triggers
```sql
-- Display all triggers in the database
SHOW TRIGGERS FROM theatre_db;

-- Show specific trigger definition
SHOW CREATE TRIGGER trg_booking_after_insert;
SHOW CREATE TRIGGER trg_booking_after_update;
```

---

### Part 4: Demonstrate Stored Procedures (5 minutes)

#### Procedure 1: Book Ticket with Transaction Safety

```sql
-- Show the procedure
SHOW CREATE PROCEDURE sp_book_ticket;

-- Call the procedure
CALL sp_book_ticket(
    1,              -- customer_id
    5,              -- show_id
    2,              -- number of seats
    'card',         -- payment method
    @booking_id,    -- OUT parameter for booking ID
    @error          -- OUT parameter for error message
);

-- Check results
SELECT @booking_id as 'Booking ID', @error as 'Error Message';

-- Verify the booking was created
SELECT * FROM booking WHERE booking_id = @booking_id;

-- Verify seats were decremented
SELECT show_id, available_seats FROM showtime WHERE show_id = 5;
```

#### Procedure 2: Get Total Revenue

```sql
-- Show the procedure
SHOW CREATE PROCEDURE sp_get_total_revenue;

-- Call the procedure for a date range
CALL sp_get_total_revenue(
    '2025-11-01 00:00:00',
    '2025-11-30 23:59:59',
    @total_revenue
);

-- Display result
SELECT @total_revenue as 'November 2025 Revenue';
```

---

### Part 5: Demonstrate Functions (3 minutes)

#### Function: Calculate Show Revenue

```sql
-- Show the function
SHOW CREATE FUNCTION fn_show_revenue;

-- Use the function to get revenue for specific shows
SELECT show_id, 
       fn_show_revenue(show_id) as revenue
FROM showtime 
WHERE show_id IN (1, 2, 3, 4, 5)
ORDER BY revenue DESC;

-- Use in a complex query
SELECT m.title, 
       COUNT(DISTINCT s.show_id) as total_shows,
       SUM(fn_show_revenue(s.show_id)) as total_revenue
FROM movie m
JOIN showtime s ON m.movie_id = s.movie_id
GROUP BY m.movie_id, m.title
ORDER BY total_revenue DESC
LIMIT 5;
```

---

### Part 6: Complex Queries (5 minutes)

#### Nested Query: Customers who booked top revenue movie
```sql
SELECT DISTINCT c.cust_id, c.name, c.email
FROM customer c
JOIN booking b ON b.cust_id = c.cust_id AND b.status='confirmed'
JOIN showtime s ON s.show_id = b.show_id
WHERE s.movie_id = (
    SELECT movie_id FROM (
        SELECT s2.movie_id, SUM(b2.total_amount) as rev
        FROM booking b2
        JOIN showtime s2 ON s2.show_id = b2.show_id
        WHERE b2.status='confirmed'
        GROUP BY s2.movie_id
        ORDER BY rev DESC
        LIMIT 1
    ) AS top_movie
)
ORDER BY c.name;
```

#### Join Query: Complete booking details
```sql
SELECT b.booking_id,
       c.name as customer_name,
       c.email,
       m.title as movie,
       t.name as theatre,
       sc.name as screen,
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
ORDER BY b.booking_time DESC
LIMIT 10;
```

#### Aggregate Query: Theatre performance analysis
```sql
SELECT t.name as theatre,
       t.city,
       COUNT(DISTINCT sc.screen_id) as total_screens,
       COUNT(DISTINCT s.show_id) as total_shows,
       COUNT(b.booking_id) as total_bookings,
       SUM(b.seats_booked) as total_seats_sold,
       SUM(b.total_amount) as total_revenue,
       AVG(b.total_amount) as avg_booking_value
FROM theatre t
LEFT JOIN screen sc ON t.theatre_id = sc.theatre_id
LEFT JOIN showtime s ON sc.screen_id = s.screen_id
LEFT JOIN booking b ON s.show_id = b.show_id AND b.status = 'confirmed'
GROUP BY t.theatre_id, t.name, t.city
ORDER BY total_revenue DESC;
```

---

### Part 7: Views (2 minutes)

```sql
-- Show active shows view
SELECT * FROM v_active_shows LIMIT 10;

-- Show theatre revenue view
SELECT * FROM v_theatre_revenue;
```

---

### Part 8: Application Demo (5 minutes)

1. **Open Frontend**: http://localhost:8080
2. **Show Registration**: Create a new user account
3. **Show Login**: Login with the new account
4. **Browse Shows**: Filter by movie, date, theatre
5. **Book Tickets**: 
   - Select a show
   - Choose individual seats (A1, B2, etc.)
   - Complete booking
6. **Show Booking History**: View "My Bookings"
7. **Admin Dashboard**: 
   - Login as admin (admin@theatre.com / admin123)
   - Show live statistics
   - Show revenue charts
   - Show recent bookings

---

### Part 9: Real-time Updates Demo (3 minutes)

```sql
-- Terminal 1: Watch available seats in real-time
SELECT show_id, available_seats FROM showtime WHERE show_id = 10;

-- Terminal 2: Make a booking through the application
-- (Use the web interface to book tickets)

-- Terminal 1: Check again - seats should be reduced
SELECT show_id, available_seats FROM showtime WHERE show_id = 10;

-- Show the booking was recorded
SELECT * FROM booking ORDER BY booking_id DESC LIMIT 1;

-- Show individual seats were tracked
SELECT * FROM seat_booking ORDER BY seat_booking_id DESC LIMIT 5;
```

---

## Demo Tips

1. **Keep MySQL terminal open** to show real-time updates
2. **Have browser open** with the application running
3. **Prepare test data** before the demo
4. **Practice the flow** to ensure smooth presentation
5. **Explain each trigger/procedure** as it executes
6. **Show before/after states** for all operations

## Key Points to Emphasize

- ✅ **Triggers** automatically maintain data integrity
- ✅ **Stored Procedures** ensure transaction safety
- ✅ **Functions** enable reusable calculations
- ✅ **Complex Queries** extract valuable insights
- ✅ **Real-time updates** between database and application
- ✅ **Individual seat tracking** for precise booking management
