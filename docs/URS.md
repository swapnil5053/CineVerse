# User Requirement Specification (URS)

## Purpose
The Theatre Management System (TMS) enables theatres to manage movies, screens, shows, and bookings. It provides secure customer bookings and an admin back office with dashboards and data insights, backed by a normalized MySQL schema with triggers, stored procedures, and functions.

## Scope
- Web-based application using Flask and MySQL.
- Admins can manage core entities (Theatres, Screens, Movies, Shows, Customers, Staff) with full CRUD.
- Customers can register, login, browse shows, and book tickets.
- System maintains seat availability and supports analytics and revenue insights.

## Detailed Description
The system models theatres with multiple screens, each hosting showtimes for movies. Screens have capacities and types. Bookings are transactional and adjust available seats using triggers. Admin dashboard visualizes KPIs (e.g., revenue, occupancy) using aggregated queries and views.

Core database objects include:
- Tables: theatre, screen, movie, customer, staff, showtime, booking, screen_resource
- Constraints: primary/foreign keys, unique constraints, checks
- Indexes: search and reporting optimizations
- Triggers: maintain available seats across lifecycle of bookings and showtimes
- Procedures/Functions: `sp_book_ticket`, `sp_get_total_revenue`, `fn_show_revenue`
- Views: `v_active_shows`, `v_theatre_revenue`

## Functional Requirements
- Admin Authentication and Role-based access
- Manage Theatres (CRUD)
- Manage Screens (CRUD) with capacities and types
- Manage Movies (CRUD)
- Manage Shows/Showtimes (CRUD) with price tiers and base price
- Manage Customers (list/edit)
- Manage Staff (CRUD)
- Browse Shows with filters
- Book Tickets (transaction via stored procedure)
- My Bookings view
- Admin Dashboard with charts and KPIs
- SQL Demos page to showcase Nested/Join/Aggregate queries, Functions, and Procedures

## Non-Functional Requirements
- Security: CSRF protection, prepared statements, hashed passwords
- Performance: indexed queries for shows and reporting
- Reliability: triggers uphold seat invariants; stored procedures ensure transactional safety
- Portability: documented setup for Windows; standard MySQL 8+; Python 3.10+

## Assumptions & Constraints
- Single database `theatre_db`
- Minimal PII stored for customers
- Payment is simulated; no external payment gateway integration

## Out of Scope
- Seat-by-seat reservation storage (currently count-based booking)
- Staff mobile app
