# CineVerse - Theatre Management System
## DBMS Project Report

---

## Team Details

**Project Title**: CineVerse - Comprehensive Theatre Management and Booking System

**Team Members**:
- Member 1: [Your Name] - [SRN]
- Member 2: [Partner Name] - [SRN]

**Course**: Database Management Systems (DBMS)  
**Institution**: PES University  
**Academic Year**: 2024-2025  
**Submission Date**: [Date]

---

## Abstract

CineVerse is a comprehensive, production-ready theatre management and movie booking system that demonstrates advanced database concepts including triggers, stored procedures, functions, and complex queries. The system features real-time seat selection, transaction-safe booking, admin analytics dashboard, and a modern React-based user interface. Built with Flask (Python) backend and MySQL database, it handles 40+ movies, 4200+ shows across 6 months, and supports individual seat tracking for precise booking management. The application successfully implements all CRUD operations, maintains data integrity through triggers, and provides valuable business insights through complex analytical queries.

---

## 1. Purpose of the Project

The CineVerse Theatre Management System aims to digitize and streamline the complete cinema booking workflow, addressing the needs of both cinema operators and moviegoers. The system eliminates manual booking processes, prevents double-bookings through real-time seat tracking, and provides cinema owners with actionable insights through comprehensive analytics.

**Key Objectives**:
- Provide a seamless online booking experience with real-time seat selection
- Automate theatre operations including show management and revenue tracking
- Ensure data integrity through database triggers and stored procedures
- Enable data-driven decision making through analytical dashboards
- Demonstrate advanced DBMS concepts in a real-world application

---

## 2. Scope of the Project

The system encompasses the complete lifecycle of cinema operations from show scheduling to booking management and analytics. It serves three primary user roles: customers (booking tickets), administrators (managing operations), and the system itself (maintaining data integrity).

**Functional Scope**:
- User authentication and authorization (admin/customer roles)
- Movie and show management across multiple theatres
- Real-time seat selection with visual seat maps
- Transaction-safe booking with automatic seat allocation
- Booking history and cancellation management
- Admin dashboard with revenue analytics and booking statistics
- Individual seat tracking (A1, B2, C3, etc.)
- Multiple pricing tiers (Standard, Premium, VIP)

**Technical Scope**:
- MySQL database with 9 tables, 4 triggers, 2 stored procedures, 1 function, 2 views
- RESTful API backend with 20+ endpoints
- Modern React frontend with TypeScript
- Real-time data synchronization between frontend and database
- Comprehensive error handling and validation

---

## 3. Detailed Description

### 3.1 System Overview

CineVerse operates as a 3-tier web application with clear separation between presentation (React frontend), application logic (Flask API), and data storage (MySQL database). The system manages three theatres with seven screens, supporting 40 movies and over 4,200 shows spanning six months.

### 3.2 User Workflows

**Customer Workflow**:
1. Register/Login to the system
2. Browse available shows with filters (movie, date, theatre)
3. Select a show and view available seats in a visual seat map
4. Choose specific seats (e.g., A1, B5, C3)
5. Complete booking with payment method selection
6. Receive booking confirmation with seat details
7. View booking history and manage bookings

**Admin Workflow**:
1. Login with admin credentials
2. View real-time dashboard with key metrics
3. Monitor recent bookings and revenue trends
4. Analyze top-performing movies and theatres
5. Add new shows with movie, theatre, time, and pricing
6. Track customer analytics and booking patterns

### 3.3 Database Design

The database follows 3NF (Third Normal Form) with proper normalization to eliminate redundancy. Key design decisions include:

- **Separate seat_booking table**: Tracks individual seats (A1, B2) rather than just count
- **Enum types**: For status fields to ensure data consistency
- **Foreign key constraints**: Maintain referential integrity with CASCADE/RESTRICT rules
- **Unique constraints**: Prevent duplicate shows at same time/screen
- **Check constraints**: Validate data (e.g., capacity > 0, seats_booked > 0)

### 3.4 Key Features

**Real-time Seat Management**:
- Triggers automatically update available_seats on booking/cancellation
- Individual seat tracking prevents double-booking
- Visual feedback shows booked/available seats instantly

**Transaction Safety**:
- Stored procedure sp_book_ticket uses transactions with row-level locking
- Ensures atomic operations (all-or-nothing booking)
- Handles concurrent bookings without conflicts

**Business Intelligence**:
- Aggregate queries provide revenue analysis by theatre, movie, date
- Nested queries identify top customers and movies
- Views simplify complex data access for reporting

---

## 4. Functional Requirements

### FR1: User Authentication and Authorization
**Description**: System shall support user registration, login, and role-based access control (admin/customer).

### FR2: Movie and Show Management
**Description**: Admins shall be able to add movies and schedule shows across multiple theatres and screens.

### FR3: Show Browsing and Filtering
**Description**: Customers shall be able to browse shows with filters for movie title, date, and theatre location.

### FR4: Individual Seat Selection
**Description**: System shall display visual seat map with row/seat numbering (A1, B2, etc.) and allow selection of specific seats.

### FR5: Real-time Seat Availability
**Description**: System shall update seat availability in real-time, preventing double-booking through database triggers.

### FR6: Booking Management
**Description**: Customers shall be able to book tickets, view booking history, and cancel bookings with automatic seat restoration.

### FR7: Payment Processing
**Description**: System shall support multiple payment methods (UPI, Card, Cash, Net Banking).

### FR8: Admin Dashboard
**Description**: Admins shall have access to analytics dashboard showing revenue, bookings, top movies, and recent activity.

### FR9: Revenue Analytics
**Description**: System shall provide revenue reports by date range, theatre, movie, and screen.

### FR10: Data Integrity
**Description**: Database triggers shall automatically maintain data consistency for seat counts and booking status.

---

## 5. Software/Tools/Programming Languages Used

### Backend
- **Python 3.12** - Primary programming language
- **Flask 3.0** - Web framework for REST API
- **MySQL Connector Python 9.0** - Database connectivity
- **Passlib** - Password hashing (PBKDF2-SHA256)
- **Flask-CORS** - Cross-origin resource sharing
- **Python-dotenv** - Environment variable management

### Frontend
- **React 18** - UI library
- **TypeScript 5.8** - Type-safe JavaScript
- **Vite 5.4** - Build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Shadcn/ui** - Component library (Radix UI primitives)
- **React Router 6** - Client-side routing
- **Sonner** - Toast notifications

### Database
- **MySQL 8.0** - Relational database management system
- **MySQL Workbench** - Database design and administration

### Development Tools
- **Git** - Version control
- **GitHub** - Code repository
- **VS Code** - Code editor
- **Postman** - API testing
- **Chrome DevTools** - Frontend debugging

### Deployment
- **Local Development Server** - Flask development server
- **Vite Dev Server** - Frontend hot module replacement

---

## 6. ER Diagram

See `docs/ERD.mmd` for the complete Entity Relationship Diagram in Mermaid format.

**Key Entities**:
- Theatre (1) ──── (M) Screen
- Screen (1) ──── (M) Showtime
- Movie (1) ──── (M) Showtime
- Customer (1) ──── (M) Booking
- Showtime (1) ──── (M) Booking
- Booking (1) ──── (M) Seat_Booking
- Theatre (1) ──── (M) Staff
- Screen (1) ──── (M) Screen_Resource

---

## 7. Relational Schema

See `docs/RelationalSchema.mmd` for the complete relational schema diagram.

**Tables**:
1. **theatre** (theatre_id PK, name, city, contact_no, address)
2. **screen** (screen_id PK, theatre_id FK, name, type, capacity, status)
3. **movie** (movie_id PK, title, duration_minutes, genre, language, rating, release_date, status)
4. **customer** (cust_id PK, name, email UK, contact_no, membership_status, role, password_hash)
5. **showtime** (show_id PK, screen_id FK, movie_id FK, show_date, show_time, price_type, base_price, available_seats)
6. **booking** (booking_id PK, cust_id FK, show_id FK, booking_time, seats_booked, total_amount, payment_method, status)
7. **seat_booking** (seat_booking_id PK, booking_id FK, show_id FK, seat_id, status, created_at)
8. **staff** (staff_id PK, theatre_id FK, name, role, contact_no, salary)
9. **screen_resource** (resource_id PK, screen_id FK, type, quantity, status)

---

## 8. DDL Commands

All DDL commands are available in `db/theatre_management.sql`. Key commands include:

```sql
-- Create database
CREATE DATABASE theatre_db;

-- Create tables with constraints
CREATE TABLE theatre (...);
CREATE TABLE screen (...);
CREATE TABLE movie (...);
-- ... (see file for complete DDL)

-- Create indexes
CREATE INDEX idx_showtime_date ON showtime (show_date, show_time);
CREATE INDEX idx_booking_time ON booking (booking_time);

-- Create views
CREATE VIEW v_active_shows AS ...;
CREATE VIEW v_theatre_revenue AS ...;
```

---

## 9. CRUD Operation Screenshots

### CREATE Operations
- Insert new movie
- Add new show
- Create customer account
- Book tickets

### READ Operations
- Browse shows with filters
- View booking history
- Display admin dashboard
- Query theatre revenue

### UPDATE Operations
- Modify movie rating
- Update customer membership
- Change booking status
- Adjust show pricing

### DELETE Operations
- Cancel booking
- Remove archived movies
- Delete old cancelled bookings

*(Screenshots to be added during demo)*

---

## 10. Application Features and Screenshots

### Feature 1: User Registration and Login
- Secure password hashing
- Role-based access control
- Session management

### Feature 2: Show Browsing
- Filter by movie, date, theatre
- Pagination (12 shows per page)
- Real-time availability display

### Feature 3: Seat Selection
- Visual seat map with row/column layout
- Color-coded seat types (Standard/Premium/VIP)
- Real-time booking status

### Feature 4: Booking Confirmation
- Individual seat tracking
- Multiple payment methods
- Instant confirmation

### Feature 5: Admin Dashboard
- Revenue analytics (daily/monthly)
- Top movies by bookings
- Recent booking activity
- Interactive charts

*(Screenshots to be added during demo)*

---

## 11. Triggers, Procedures, Functions

### Triggers

**trg_booking_after_insert**: Automatically decrements available_seats when a confirmed booking is created.

**trg_booking_after_update**: Restores seats when booking is cancelled/refunded and updates seat_booking status.

**trg_booking_after_delete**: Restores seats if a confirmed booking is deleted.

**trg_showtime_set_capacity**: Sets available_seats to screen capacity when show is created with 0 seats.

### Stored Procedures

**sp_book_ticket**: Transaction-safe booking with row-level locking, validates seat availability, calculates total amount, creates booking record.

**sp_get_total_revenue**: Calculates total confirmed booking revenue for a specified date range.

### Functions

**fn_show_revenue**: Returns total revenue for a specific show from all confirmed bookings.

---

## 12. Code Snippets

### Invoking Stored Procedure
```sql
CALL sp_book_ticket(1, 5, 2, 'card', @booking_id, @error);
SELECT @booking_id, @error;
```

### Invoking Function
```sql
SELECT show_id, fn_show_revenue(show_id) as revenue
FROM showtime
ORDER BY revenue DESC
LIMIT 5;
```

### Trigger Demonstration
```sql
-- Check seats before booking
SELECT available_seats FROM showtime WHERE show_id = 1;

-- Create booking (trigger fires automatically)
INSERT INTO booking (...) VALUES (...);

-- Check seats after booking (reduced automatically)
SELECT available_seats FROM showtime WHERE show_id = 1;
```

---

## 13. SQL Queries Used

All queries are documented in `db/ALL_QUERIES.sql`, categorized as:

1. DDL (CREATE TABLE, CREATE INDEX, CREATE VIEW)
2. DML (INSERT, UPDATE, DELETE)
3. Triggers (4 triggers)
4. Stored Procedures (2 procedures)
5. Functions (1 function)
6. Views (2 views)
7. Nested Queries (3 examples)
8. Join Queries (3 examples with 3-5 table joins)
9. Aggregate Queries (4 examples with GROUP BY, HAVING)
10. Complex Analytical Queries (3 examples)

---

## 14. GitHub Repository

**Repository URL**: [Your GitHub Repo Link]

**Repository Structure**:
```
CineVerse/
├── README.md
├── docs/ (all documentation)
├── db/ (SQL files)
├── frontend-main/ (React app)
├── routes/ (Flask API routes)
├── app.py (backend)
└── generate_shows.py
```

---

## 15. Conclusion

CineVerse successfully demonstrates a production-ready database application with advanced DBMS concepts. The system handles real-world cinema operations including concurrent bookings, real-time seat management, and comprehensive analytics. Key achievements include:

- **Data Integrity**: Triggers ensure automatic consistency
- **Transaction Safety**: Stored procedures prevent booking conflicts
- **Scalability**: Handles 4200+ shows efficiently
- **User Experience**: Modern UI with real-time updates
- **Business Value**: Actionable insights through analytics

The project showcases practical application of database design principles, normalization, indexing, and query optimization in a real-world scenario.

---

## 16. Future Enhancements

- Payment gateway integration
- Email/SMS notifications
- Movie recommendations using ML
- Dynamic pricing based on demand
- Mobile application
- Multi-language support
- Loyalty program management
- Advanced reporting with data visualization

---

## Appendix

### A. Database Statistics
- Tables: 9
- Triggers: 4
- Stored Procedures: 2
- Functions: 1
- Views: 2
- Movies: 40
- Shows: 4,200+
- Theatres: 3
- Screens: 7

### B. API Endpoints
- Authentication: 4 endpoints
- Shows: 3 endpoints
- Booking: 4 endpoints
- Admin: 5 endpoints
- Total: 20+ endpoints

### C. References
- MySQL Documentation: https://dev.mysql.com/doc/
- Flask Documentation: https://flask.palletsprojects.com/
- React Documentation: https://react.dev/

---

**End of Report**
