# 🎯 CineVerse Demo Checklist

## Pre-Demo Setup (15 minutes before)

### 1. Start Services
- [ ] Start MySQL server
- [ ] Open Terminal 1: Run `python app.py`
- [ ] Open Terminal 2: Run `cd frontend-main && npm run dev`
- [ ] Verify backend: http://127.0.0.1:5000/health
- [ ] Verify frontend: http://localhost:8080

### 2. Prepare MySQL Terminal
- [ ] Open MySQL Workbench or terminal
- [ ] Connect to theatre_db
- [ ] Have `docs/DEMO_GUIDE.md` open for reference
- [ ] Have `db/ALL_QUERIES.sql` open

### 3. Prepare Browser
- [ ] Open http://localhost:8080 in Chrome
- [ ] Have admin login ready (admin@theatre.com / admin123)
- [ ] Clear browser cache if needed
- [ ] Open DevTools (F12) to show network requests

### 4. Test Everything
- [ ] Test login/registration
- [ ] Test show browsing
- [ ] Test booking flow
- [ ] Test admin dashboard
- [ ] Verify database updates in MySQL

---

## Demo Flow (30 minutes)

### Part 1: Introduction (2 min)
- [ ] Introduce project: CineVerse Theatre Management System
- [ ] Mention team members
- [ ] State purpose: Digitize cinema booking with real-time seat management
- [ ] Highlight: 40 movies, 4200+ shows, 3 theatres, 7 screens

### Part 2: Database Structure (3 min)
- [ ] Show ER Diagram (`docs/ERD.mmd`)
- [ ] Show Relational Schema (`docs/RelationalSchema.mmd`)
- [ ] Run: `SHOW TABLES;`
- [ ] Run: `DESCRIBE showtime;` and `DESCRIBE booking;`
- [ ] Explain key relationships

### Part 3: CRUD Operations (5 min)
- [ ] **CREATE**: Insert new movie
  ```sql
  INSERT INTO movie (title, duration_minutes, genre, language, rating, release_date, status)
  VALUES ('Demo Movie', 135, 'Action', 'English', 8.5, '2026-06-01', 'upcoming');
  ```
- [ ] **READ**: Query shows
  ```sql
  SELECT * FROM v_active_shows LIMIT 5;
  ```
- [ ] **UPDATE**: Modify movie rating
  ```sql
  UPDATE movie SET rating = 9.0 WHERE title = 'Demo Movie';
  ```
- [ ] **DELETE**: Remove demo movie
  ```sql
  DELETE FROM movie WHERE title = 'Demo Movie';
  ```

### Part 4: Triggers Demo (5 min)
- [ ] Show trigger code: `SHOW CREATE TRIGGER trg_booking_after_insert;`
- [ ] Check seats before: `SELECT available_seats FROM showtime WHERE show_id = 1;`
- [ ] Create booking:
  ```sql
  INSERT INTO booking (cust_id, show_id, seats_booked, total_amount, payment_method, status)
  VALUES (1, 1, 3, 660.00, 'upi', 'confirmed');
  ```
- [ ] Check seats after (should be reduced by 3)
- [ ] Cancel booking:
  ```sql
  UPDATE booking SET status = 'cancelled' WHERE booking_id = [last_id];
  ```
- [ ] Check seats restored

### Part 5: Stored Procedures (4 min)
- [ ] Show procedure: `SHOW CREATE PROCEDURE sp_book_ticket;`
- [ ] Call procedure:
  ```sql
  CALL sp_book_ticket(1, 5, 2, 'card', @booking_id, @error);
  SELECT @booking_id, @error;
  ```
- [ ] Verify booking created
- [ ] Show revenue procedure:
  ```sql
  CALL sp_get_total_revenue('2025-11-01', '2025-11-30', @revenue);
  SELECT @revenue;
  ```

### Part 6: Functions (2 min)
- [ ] Show function: `SHOW CREATE FUNCTION fn_show_revenue;`
- [ ] Use function:
  ```sql
  SELECT show_id, fn_show_revenue(show_id) as revenue
  FROM showtime LIMIT 5;
  ```

### Part 7: Complex Queries (4 min)
- [ ] **Nested Query**: Top movie customers
  ```sql
  SELECT DISTINCT c.name, c.email
  FROM customer c
  JOIN booking b ON b.cust_id = c.cust_id
  JOIN showtime s ON s.show_id = b.show_id
  WHERE s.movie_id = (
    SELECT movie_id FROM (
      SELECT s2.movie_id, SUM(b2.total_amount) as rev
      FROM booking b2
      JOIN showtime s2 ON s2.show_id = b2.show_id
      WHERE b2.status='confirmed'
      GROUP BY s2.movie_id
      ORDER BY rev DESC LIMIT 1
    ) AS top
  );
  ```
- [ ] **Join Query**: Complete booking details (5-table join)
- [ ] **Aggregate Query**: Theatre performance analysis

### Part 8: Application Demo (5 min)
- [ ] **Registration**: Create new user account
- [ ] **Login**: Login with new account
- [ ] **Browse Shows**: Show filtering by movie/date/theatre
- [ ] **Book Tickets**: 
  - Select a show
  - Show seat map
  - Select seats (A1, B2, etc.)
  - Complete booking
- [ ] **Booking History**: Show "My Bookings"
- [ ] **Admin Dashboard**:
  - Login as admin
  - Show revenue stats
  - Show top movies
  - Show recent bookings

### Part 9: Real-time Updates (3 min)
- [ ] Split screen: MySQL + Browser
- [ ] Check seats in MySQL: `SELECT available_seats FROM showtime WHERE show_id = 10;`
- [ ] Book tickets through web app
- [ ] Show seats updated in MySQL immediately
- [ ] Show booking record created
- [ ] Show individual seats tracked in seat_booking table

### Part 10: Q&A (2 min)
- [ ] Answer questions about design decisions
- [ ] Explain normalization choices
- [ ] Discuss scalability considerations

---

## Key Points to Emphasize

### Technical Excellence
- ✅ **3NF Normalization**: No redundancy, proper foreign keys
- ✅ **ACID Transactions**: Stored procedures ensure atomicity
- ✅ **Data Integrity**: Triggers maintain consistency automatically
- ✅ **Indexing**: Optimized queries with proper indexes
- ✅ **Constraints**: Check, unique, foreign key constraints

### Business Value
- ✅ **Real-time**: Instant seat updates prevent double-booking
- ✅ **Scalability**: Handles 4200+ shows efficiently
- ✅ **Analytics**: Actionable insights for business decisions
- ✅ **User Experience**: Modern UI with smooth interactions
- ✅ **Reliability**: Transaction-safe booking process

### Advanced Features
- ✅ **Individual Seat Tracking**: Not just count, but exact seats (A1, B2)
- ✅ **Multiple Pricing Tiers**: Standard, Premium, VIP
- ✅ **Role-based Access**: Admin vs Customer permissions
- ✅ **Complex Queries**: Nested, joins, aggregates for insights
- ✅ **Views**: Simplified data access for common queries

---

## Common Questions & Answers

**Q: Why use triggers instead of application logic?**
A: Triggers ensure data integrity at database level, work regardless of which application accesses the database, and execute atomically with the triggering statement.

**Q: How do you prevent double-booking?**
A: Stored procedure uses row-level locking (FOR UPDATE), triggers update seats atomically, and seat_booking table tracks individual seats with unique constraint.

**Q: Why separate seat_booking table?**
A: Allows tracking exact seats (A1, B2), enables seat-level operations (cancel specific seats), provides audit trail, and supports future features like seat preferences.

**Q: How does the system scale?**
A: Connection pooling, indexed queries, efficient triggers, pagination in API, and database design supports horizontal scaling by adding more theatres/screens.

**Q: What about concurrent bookings?**
A: Stored procedure uses FOR UPDATE lock, transactions ensure atomicity, and triggers execute in same transaction context.

---

## Backup Queries (If Something Fails)

### If booking fails:
```sql
-- Check show exists
SELECT * FROM showtime WHERE show_id = 1;

-- Check customer exists
SELECT * FROM customer WHERE cust_id = 1;

-- Check seats available
SELECT available_seats FROM showtime WHERE show_id = 1;
```

### If trigger doesn't fire:
```sql
-- Check trigger exists
SHOW TRIGGERS;

-- Recreate trigger if needed
-- (code in theatre_management.sql)
```

### If data looks wrong:
```sql
-- Reset seats to capacity
UPDATE showtime s 
JOIN screen sc ON s.screen_id = sc.screen_id 
SET s.available_seats = sc.capacity;
```

---

## Post-Demo

- [ ] Thank the evaluators
- [ ] Mention GitHub repo link
- [ ] Offer to show any specific feature in detail
- [ ] Be ready for viva questions

---

## Emergency Contacts

- **If MySQL crashes**: Restart MySQL service
- **If Flask crashes**: Check terminal for error, restart `python app.py`
- **If Frontend crashes**: Restart `npm run dev`
- **If browser issues**: Clear cache, use incognito mode

---

## Files to Have Ready

1. `docs/DEMO_GUIDE.md` - Detailed demo script
2. `db/ALL_QUERIES.sql` - All SQL queries
3. `docs/ERD.mmd` - ER Diagram
4. `docs/RelationalSchema.mmd` - Schema diagram
5. `docs/PROJECT_REPORT.md` - Complete report
6. `README.md` - Project overview

---

**Good Luck with Your Demo! 🎬🎉**
