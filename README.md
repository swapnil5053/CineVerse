# CineVerse

A theatre management and movie booking system I built to explore full-stack development. You can browse 40 movies, pick your actual seats on a cinema map, and watch real-time bookings happen. There's also an admin dashboard for tracking revenue and seeing which movies are performing.

**Stack**: Flask (backend), React + TypeScript (frontend), MySQL (database), Tailwind for styling.

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MySQL 8.0+

### Setup

Clone and set up the backend:
```powershell
git clone https://github.com/swapnil5053/CineVerse.git
cd CineVerse

python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Database setup (you'll need your MySQL root password):
```powershell
mysql -u root -p -e "DROP DATABASE IF EXISTS theatre_db; CREATE DATABASE theatre_db; CREATE USER IF NOT EXISTS 'theatre_app'@'localhost' IDENTIFIED BY 'theatre_app_pass'; GRANT ALL PRIVILEGES ON theatre_db.* TO 'theatre_app'@'localhost'; FLUSH PRIVILEGES; SET GLOBAL log_bin_trust_function_creators = 1;"

Get-Content "db/theatre_management.sql" | mysql -u root -p theatre_db
Get-Content "db/seat_booking_update.sql" | mysql -u root -p theatre_db
Get-Content "db/add_movies.sql" | mysql -u root -p theatre_db
Get-Content "db/add_admin.sql" | mysql -u root -p

python generate_shows.py
```

Frontend:
```powershell
cd frontend-main
npm install
cd ..
```

Running it:
```powershell
# Terminal 1
python app.py

# Terminal 2
cd frontend-main
npm run dev
```

Then hit up http://localhost:8080. Use `admin@theatre.com / admin123` to login as admin, or create a new user.

## What's In Here

The backend is Flask + MySQL with endpoints for authentication, show filtering, and bookings. Seats are tracked individually so no double-bookings. Real-time updates mean when someone books a seat, everyone sees it disappear instantly.

Frontend is React with a seat selection map (cinema-style layout), booking management, and an admin dashboard that shows stats and recent activity. Everything's styled with Tailwind and uses Shadcn components.

Seats are tiered—standard (front rows), premium (middle, +₹100), and VIP recliners (back, +₹200). Shows run for 6 months, so there's plenty to book.

## How to Use It

**As a customer**: Register, browse movies and showtimes, pick your seats from the interactive map, book up to 10 seats at once, and manage your bookings.

**As an admin**: Login and see a dashboard with live stats, all bookings, revenue breakdowns, and which movies are doing well. You can add new shows by specifying the movie, theatre, time, and ticket price.

## Main API Routes

Auth: `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`

Shows/Movies: `GET /api/shows`, `GET /api/movies`, `GET /api/theatres`

Booking: `POST /api/book`, `GET /api/my-bookings`, `POST /api/cancel-booking/:id`

Admin: `GET /api/admin/stats`, `GET /api/admin/bookings`

## Architecture

```
CineVerse/
├── Backend (Flask)
│   ├── app.py
│   ├── routes/
│   ├── db/
│   └── utils/
├── Frontend (React)
│   ├── src/pages/
│   ├── src/components/
│   ├── src/services/
│   └── public/
└── Database (MySQL)
```

## Security

Nothing fancy here but the basics are covered—bcrypt for passwords, HTTP-only cookies for sessions, parameterized queries to prevent SQL injection, CORS configured, and input validation on both ends.

## Docs

If you want the nitty-gritty details, check the [docs](docs/) folder for setup guides, system architecture, technical documentation, and project structure breakdowns.

---

Built to learn full-stack development and understand how cinema booking systems actually work under the hood.
