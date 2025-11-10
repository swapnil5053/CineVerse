# 🎬 CineVerse - Your Ultimate Cinema Experience

A comprehensive, modern theatre management and movie booking system with interactive seat selection, real-time analytics, and beautiful UI design.

![CineVerse](https://img.shields.io/badge/CineVerse-Theatre%20Management-red?style=for-the-badge&logo=film)
![Flask](https://img.shields.io/badge/Flask-Backend-blue?style=flat-square&logo=flask)
![React](https://img.shields.io/badge/React-Frontend-cyan?style=flat-square&logo=react)
![MySQL](https://img.shields.io/badge/MySQL-Database-orange?style=flat-square&logo=mysql)

## 📚 Documentation

- **[Setup Guide](docs/SETUP.md)** - Detailed installation instructions
- **[System Summary](docs/SYSTEM_SUMMARY.md)** - Features and capabilities overview
- **[Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md)** - Architecture and API details
- **[Project Structure](docs/PROJECT_STRUCTURE.md)** - File organization guide
- **[Documentation Index](docs/DOCUMENTATION_INDEX.md)** - Complete documentation navigation

## ✨ What Makes CineVerse Special?

### � **For Movie Lovers**
- **Real Seat Selection**: Pick your exact seats just like at the cinema - A1, B5, you name it!
- **Smart Pricing**: Standard seats up front, Premium in the middle, VIP recliners at the back
- **Live Updates**: See which seats are taken in real-time (no more booking conflicts!)
- **6 Months of Shows**: Browse movies from November 2025 through May 2026
- **Works Everywhere**: Looks great on your phone, tablet, or computer

### 🎯 **For Cinema Owners**
- **Live Dashboard**: Watch bookings roll in and track your revenue in real-time
- **Easy Show Management**: Add new shows with a few clicks - pick the movie, theatre, time, and price
- **Smart Analytics**: See which movies are hot and which time slots work best
- **Customer Insights**: Track booking patterns and customer preferences

### 🎨 **The Experience**
- **Beautiful Design**: Dark theme with glass-like effects that's easy on the eyes
- **Smooth Interactions**: Everything feels responsive and modern
- **No Confusion**: Clear seat types with color coding (Standard, Premium, VIP)
- **Instant Feedback**: Know immediately if your booking worked or if there's an issue

## 🚀 Getting Started (It's Easier Than You Think!)

### What You'll Need
- Python 3.8+ (for the backend magic)
- Node.js 16+ (for the pretty frontend)
- MySQL 8.0+ (to store all the data)

### Let's Get This Running!

**Step 1: Get the Code**
```powershell
# Grab the project
git clone https://github.com/swapnil5053/CineVerse.git
cd CineVerse

# Set up Python environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Step 2: Database Setup**
*Note: You'll be prompted for your MySQL root password for each command*

```powershell
# Create database and user (one command)
mysql -u root -p -e "DROP DATABASE IF EXISTS theatre_db; CREATE DATABASE theatre_db; CREATE USER IF NOT EXISTS 'theatre_app'@'localhost' IDENTIFIED BY 'theatre_app_pass'; GRANT ALL PRIVILEGES ON theatre_db.* TO 'theatre_app'@'localhost'; FLUSH PRIVILEGES; SET GLOBAL log_bin_trust_function_creators = 1;"

# Load base schema
Get-Content "db/theatre_management.sql" | mysql -u root -p theatre_db

# Add seat booking system
Get-Content "db/seat_booking_update.sql" | mysql -u root -p theatre_db

# Add 40 movies
Get-Content "db/add_movies.sql" | mysql -u root -p theatre_db

# Add admin user
Get-Content "db/add_admin.sql" | mysql -u root -p

# Generate 4000+ shows for 6 months
python generate_shows.py
```

**Step 3: Configure Your Setup**
The `.env` file is already configured with the correct settings:
```
MYSQL_HOST=localhost
MYSQL_DB=theatre_db
MYSQL_USER=theatre_app
MYSQL_PASSWORD=theatre_app_pass
```
No action needed - the file is ready to use!

**Step 4: Frontend Setup**
```powershell
cd frontend-main
npm install
cd ..
```

**Step 5: Launch Time!**
```powershell
# Start the backend (Terminal 1)
python app.py

# Start the frontend (Terminal 2 - new window)
cd frontend-main
npm run dev
```

**Step 6: Start Booking!**
- **Your Cinema**: http://localhost:8080
- **Backend API**: http://localhost:5000

**Login Credentials**
- **Admin**: admin@theatre.com / admin123
- **New Users**: Register through the application

## 🏗️ How It's Built

I kept the architecture simple but powerful:

```
CineVerse/
├── 🐍 Backend Magic (Flask + Python)
│   ├── app.py                 # The heart of the API
│   ├── routes/                # All the endpoints
│   ├── db/                    # Database stuff
│   └── utils/                 # Helper functions
│
├── ⚛️ Frontend Beauty (React + TypeScript)
│   ├── src/pages/             # All the screens you see
│   ├── src/components/        # Reusable UI pieces
│   ├── src/services/          # Talks to the backend
│   └── public/                # Images and favicon
│
└── 📊 Database (MySQL)
    ├── Movies, theatres, shows
    ├── Individual seat tracking
    └── Real-time booking data
```

**The Cool Tech Stack:**
- **Backend**: Flask (Python) - fast and reliable
- **Frontend**: React + TypeScript - modern and type-safe
- **Database**: MySQL - handles all the complex booking logic
- **Styling**: Tailwind CSS - makes everything look good
- **Real-time**: WebSocket-like updates for live seat availability

## 🎪 The Seat Experience

**Here's what makes the booking special:**

### � Seeat Types & Pricing
- **Standard Seats** (Rows A-C): Front rows, great for action movies - Base Price
- **Premium Seats** (Rows D-G): Sweet spot for viewing - Base Price + ₹100
- **VIP Recliners** (Rows H-J): Back rows with luxury seating - Base Price + ₹200

### 🔄 Real-Time Magic
- When someone books seat A1, it instantly becomes unavailable for everyone else
- No more double bookings or seat conflicts
- Live updates without refreshing the page

### 📊 Smart Database Design
- Individual seat tracking (not just "5 seats booked")
- Automatic pricing based on seat location
- Booking history with exact seat details
- Revenue tracking by seat type

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Shows & Movies
- `GET /api/shows` - Get shows with filtering
- `GET /api/movies` - Get all movies
- `GET /api/theatres` - Get all theatres

### Booking
- `POST /api/book` - Book tickets
- `GET /api/my-bookings` - Get user bookings
- `POST /api/cancel-booking/:id` - Cancel booking

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/bookings` - All bookings
- `POST /api/admin/reset-seats` - Reset seat availability

## 🛠️ Technologies Used

### Backend Stack
- **Flask 3.0** - Python web framework
- **MySQL 8.0** - Relational database
- **Flask-CORS** - Cross-origin resource sharing
- **Passlib** - Password hashing
- **Python-dotenv** - Environment management

### Frontend Stack
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS
- **Shadcn/ui** - Component library
- **React Router** - Client-side routing
- **Sonner** - Toast notifications

### Development Tools
- **Hot Module Replacement** - Instant updates during development
- **Error Boundaries** - Graceful error handling
- **ESLint & Prettier** - Code formatting and linting

## 🎯 Key Features Explained

### Interactive Seat Selection
- Cinema-style seat map with visual feedback
- Real-time seat availability updates
- Maximum 10 seats per booking
- Booked seats are visually disabled

### Authentication System
- Session-based authentication with secure cookies
- Password hashing with bcrypt
- Role-based access (admin/customer)
- Automatic session validation

### Real-time Analytics
- Live booking statistics
- Revenue tracking (daily/monthly)
- Top-performing movies
- Recent booking activity

### Responsive Design
- Mobile-first approach
- Glassmorphism design language
- Smooth animations and transitions
- Dark theme optimized for cinema experience

## 🔒 Security Features

- **Password Hashing**: Bcrypt with salt
- **Session Management**: Secure HTTP-only cookies
- **CORS Protection**: Configured for specific origins
- **SQL Injection Prevention**: Parameterized queries
- **Input Validation**: Frontend and backend validation
- **Error Handling**: Graceful error boundaries


