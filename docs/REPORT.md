# Theatre Management System — Project Report

Course: UE23CS351A — Database Management Systems
Title: Theatre Management System
Type: Experiential Learning Project (Level 2 – Orange Problem)

## 1. Abstract
This project implements a secure, database-driven web application for managing theatres, screens, shows, customers, staff, and ticket bookings. Admins can add resources, schedule shows, and view analytics; customers can browse and book shows. Critical business logic (seat availability and booking atomicity) is enforced inside the database via triggers and stored procedures for correctness under concurrency.

## 2. Purpose & Scope
- Streamline multi-theatre operations: screens, scheduling, tickets, and staff.
- Provide analytics for data-driven decisions (revenue, occupancy, top movies).
- Ensure secure and reliable bookings at scale.

## 3. URS — User Requirements Specification
### Functional
- Admin login with dashboard access.
- CRUD: Theatres, Screens, Movies, Shows, Customers, Staff.
- Customers: register/login, view shows, book tickets, see booking history.
- Dynamic seat availability on bookings/cancellations.
- Analytics: revenue, occupancy, top movies.
- DB objects: views, triggers, procedures, functions.
- Search/filter shows by movie, date, theatre.
- Role-based access (foundation ready).

### Non-Functional
- 3NF-compliant schema.
- Responsive UI (Bootstrap), accessible defaults.
- Secure authentication and session handling.
- Scalability and minimal coupling.

## 4. ER Diagram & Relational Schema
Entities: Theatre, Screen, Movie, Showtime, Booking, Customer, Staff, ScreenResource.

Key relationships:
- Theatre 1—N Screen
- Screen 1—N Showtime
- Movie 1—N Showtime
- Customer 1—N Booking
- Theatre 1—N Staff

Primary keys are integer auto-increment. Foreign keys enforce referential integrity. See `db/theatre_management.sql` for full DDL with constraints and indexes.

## 5. DDL/DML/Views/Triggers/Procedures/Functions
- DDL: All tables with constraints and indexes.
- DML: 6–10 seed rows per table.
- Views: `v_active_shows`, `v_theatre_revenue`.
- Triggers: maintain `available_seats` on insert/update/delete of bookings; initialize seats from screen capacity for new showtimes.
- Procedures: `sp_book_ticket` (transactional booking), `sp_get_total_revenue`.
- Function: `fn_show_revenue(show_id)`.

See: `db/theatre_management.sql`.

## 6. Implementation Screenshots
- Shows listing with filters
- Booking page and confirmation
- Admin dashboard with charts
- CRUD pages (Movies, Theatres, Screens, Shows, Customers, Staff)

(Add screenshots here in final submission.)

## 7. Sample Queries + Results
- Top movies by revenue:
```sql
SELECT m.title, SUM(b.total_amount) AS rev
FROM booking b
JOIN showtime s ON b.show_id = s.show_id
JOIN movie m ON s.movie_id = m.movie_id
WHERE b.status='confirmed'
GROUP BY m.movie_id
ORDER BY rev DESC
LIMIT 5;
```
- Occupancy per show:
```sql
SELECT s.show_id,
       (sc.capacity - s.available_seats)/sc.capacity AS occupancy
FROM showtime s
JOIN screen sc ON s.screen_id = sc.screen_id;
```

## 8. GitHub Repo Link
Add your repository URL here when pushing the project.

## 9. Conclusion & Future Work
- Conclusion: The system meets functional and non-functional requirements with secure bookings and admin analytics.
- Future Work:
  - Role-based admin/staff authentication and permissions UI.
  - Email confirmations for bookings.
  - Seat map selection UI.
  - Additional reports (daily occupancy trends, movie comparisons).

## 10. Setup & Execution (Summary)
See `README.md` for detailed steps. High level:
1) Configure `.env`, 2) Run SQL script, 3) Start Flask app.

## 11. Security Considerations
- No secrets committed; use `.env`.
- Prepared statements for all DB operations.
- CSRF protection for POST requests.
- Sessions store minimal data; secure cookie in production.
- Least-privilege MySQL user recommended.
