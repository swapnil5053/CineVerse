# 🎭 CineVerse Theatre Management System - System Summary

## 🚀 System Overview

CineVerse is a comprehensive cinema booking system with real-time seat selection, admin analytics, and a modern user interface.

### 🌐 Access URLs
- **Frontend**: http://localhost:8080
- **Backend API**: http://127.0.0.1:5000

### 🔐 Login Credentials
- **Admin**: admin@theatre.com / admin123
- **Customers**: Register through the application

## ✅ System Features

### 🎬 Movie & Show Management
- **40 movies** across all genres (Action, Drama, Comedy, Romance, Sci-Fi, Horror, Thriller)
- **4,200+ shows** spanning 6+ months (November 2025 - May 2026)
- **3 theatres** with 7 screens total
- Multiple showtimes daily across all screens

### 🪑 Individual Seat Booking
- **Cinema-style seat selection** with row/seat numbering (A1, B2, C3, etc.)
- **Three pricing tiers**: Standard (rows A-C), Premium (rows D-G), VIP (rows H-J)
- **Real-time seat availability** - booked seats immediately unavailable
- **Visual seat map** with interactive selection
- **seat_booking table** tracks individual seat assignments
- **Maximum 10 seats** per booking

### 🎯 Booking System
- **Real-time availability** updates via database triggers
- **Transaction-safe booking** using stored procedures
- **Automatic pricing** based on seat type and show
- **Booking history** for all users
- **Cancellation support** with seat release
- **Payment methods**: UPI, Card, Cash, Net Banking

### 👨‍💼 Admin Dashboard
- **Live booking statistics** (today and monthly revenue)
- **Top movies** by bookings and revenue
- **Recent bookings** feed with customer details
- **Show management** - add new shows
- **Customer analytics**
- **Revenue tracking** with date ranges

### 🎨 Modern UI/UX
- **Dark theme** with glassmorphism effects
- **Responsive design** for mobile, tablet, desktop
- **Smooth animations** and transitions
- **Toast notifications** for user feedback
- **Error boundaries** for graceful error handling
- **Loading states** for better UX

## 🔧 Technical Stack

### Database (MySQL 8.0)
- **8 tables**: theatre, screen, movie, customer, showtime, booking, staff, seat_booking, screen_resource
- **4 triggers**: Automatic seat management on booking/cancellation
- **2 stored procedures**: sp_book_ticket, sp_get_total_revenue
- **1 function**: fn_show_revenue
- **2 views**: v_active_shows, v_theatre_revenue
- **Connection pooling** for performance

### Backend (Flask 3.0 + Python)
- **RESTful API** with 20+ endpoints
- **Session-based authentication** with secure cookies
- **Password hashing** using PBKDF2-SHA256
- **CORS configured** for port 8080
- **Error handling** with proper HTTP status codes
- **Database connection pooling**

### Frontend (React 18 + TypeScript)
- **Vite** for fast development and builds
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **React Router** for navigation
- **Context API** for state management
- **Sonner** for toast notifications

## 🎯 Key Features

✅ **User Authentication** - Registration, login, logout, session management  
✅ **Browse 4,200+ Shows** - Filter by movie, date, theatre  
✅ **Individual Seat Selection** - Pick exact seats (A1, B2, etc.)  
✅ **Real-time Booking** - Instant seat availability updates  
✅ **Admin Dashboard** - Revenue analytics, booking stats, top movies  
✅ **Booking Management** - View history, cancel bookings  
✅ **Responsive Design** - Works on all devices  
✅ **Dark Theme** - Modern glassmorphism UI  
✅ **Transaction Safety** - Database triggers ensure data integrity  

## 📊 Database Statistics

- **40 movies** (5 base + 35 additional)
- **4,200+ shows** generated programmatically
- **3 theatres** in different cities
- **7 screens** with varying capacities (100-200 seats)
- **1 admin user** (all others created through registration)
- **0 pre-existing bookings** (clean slate)

## 🎭 Production Ready

The system demonstrates:
- **Advanced DBMS concepts**: Triggers, stored procedures, functions, views
- **Professional architecture**: 3-tier with clear separation of concerns
- **Modern development practices**: TypeScript, component-based UI, REST API
- **Real-world functionality**: Complete cinema booking workflow
- **Scalability**: Connection pooling, indexed queries, efficient data structures