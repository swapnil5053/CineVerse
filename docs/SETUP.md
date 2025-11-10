# CineVerse - Complete Setup Guide

## Prerequisites
- Python 3.8+
- Node.js 16+
- MySQL 8.0+

## Step-by-Step Setup (PowerShell)

### 1. Install Python Dependencies
```powershell
pip install -r requirements.txt
```

### 2. Setup MySQL Database
```powershell
# Create database and user
mysql -u root -p -e "DROP DATABASE IF EXISTS theatre_db; CREATE DATABASE theatre_db; CREATE USER IF NOT EXISTS 'theatre_app'@'localhost' IDENTIFIED BY 'theatre_app_pass'; GRANT ALL PRIVILEGES ON theatre_db.* TO 'theatre_app'@'localhost'; FLUSH PRIVILEGES; SET GLOBAL log_bin_trust_function_creators = 1;"

# Load base schema (tables, triggers, procedures)
Get-Content "db/theatre_management.sql" | mysql -u root -p theatre_db

# Add seat booking table
Get-Content "db/seat_booking_update.sql" | mysql -u root -p theatre_db

# Add 40 movies
Get-Content "db/add_movies.sql" | mysql -u root -p theatre_db

# Add admin user
Get-Content "db/add_admin.sql" | mysql -u root -p

# Generate 4000+ shows for 6 months
python generate_shows.py
```

### 3. Configure Environment
The `.env` file is already configured with:
```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=theatre_db
MYSQL_USER=theatre_app
MYSQL_PASSWORD=theatre_app_pass
```

### 4. Install Frontend Dependencies
```powershell
cd frontend-main
npm install
cd ..
```

### 5. Start the Application

**Terminal 1 - Backend:**
```powershell
python app.py
```

**Terminal 2 - Frontend:**
```powershell
cd frontend-main
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:8080/
- **Backend API**: http://127.0.0.1:5000/

## Login Credentials

- **Admin**: admin@theatre.com / admin123
- **New Users**: Register through the app

## Database Files Used

1. **db/theatre_management.sql** - Base schema with tables, triggers, procedures, and sample data
2. **db/seat_booking_update.sql** - Individual seat tracking system
3. **db/add_movies.sql** - 35 additional movies (40 total)
4. **db/add_admin.sql** - Admin user with proper password hash
5. **generate_shows.py** - Python script to generate 4000+ shows across 6 months

## What You Get

- ✅ 40 movies across all genres
- ✅ 4,200+ shows spanning 6+ months (Nov 2025 - May 2026)
- ✅ 3 theatres with 7 screens
- ✅ Individual seat booking (A1, B2, etc.)
- ✅ Admin dashboard with analytics
- ✅ Real-time seat availability
- ✅ Multiple pricing tiers (Standard, Premium, VIP)

## Troubleshooting

**If shows appear as "Sold Out":**
```powershell
mysql -u root -p theatre_db -e "UPDATE showtime s JOIN screen sc ON s.screen_id = sc.screen_id SET s.available_seats = sc.capacity WHERE s.available_seats = 0;"
```

**If CORS errors occur:**
Make sure `app.py` includes `http://localhost:8080` in the CORS origins list.

**To reset the database:**
```powershell
mysql -u root -p -e "DROP DATABASE theatre_db; CREATE DATABASE theatre_db;"
# Then repeat steps 2-5
```
