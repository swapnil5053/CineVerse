# 📁 CineVerse Project Structure

## Root Directory

```
CineVerse/
├── README.md                    ⭐ START HERE - Main documentation
├── app.py                       Flask backend application
├── requirements.txt             Python dependencies
├── generate_shows.py            Script to generate 4000+ shows
├── .env                         Environment configuration
├── .gitignore                   Git ignore rules
│
├── docs/                        📚 All Documentation
│   ├── DOCUMENTATION_INDEX.md   Navigation guide for all docs
│   ├── SETUP.md                 Detailed setup instructions
│   ├── SYSTEM_SUMMARY.md        System features overview
│   ├── TECHNICAL_DOCUMENTATION.md  Technical deep dive
│   ├── REPORT.md                Academic project report
│   ├── URS.md                   User requirements specification
│   ├── ERD.mmd                  Entity Relationship Diagram
│   └── RelationalSchema.mmd     Database schema diagram
│
├── db/                          💾 Database Files
│   ├── theatre_management.sql   Base schema (tables, triggers, procedures)
│   ├── seat_booking_update.sql  Individual seat tracking
│   ├── add_movies.sql           35 additional movies
│   ├── add_admin.sql            Admin user creation
│   └── connection.py            Database connection pool
│
├── frontend-main/               ⚛️ React Frontend
│   ├── src/                     Source code
│   │   ├── components/          React components
│   │   ├── pages/               Page components
│   │   ├── contexts/            State management
│   │   ├── services/            API services
│   │   └── lib/                 Utilities
│   ├── package.json             Node dependencies
│   └── FRONTEND.md              Frontend-specific documentation
│
├── routes/                      🛣️ Flask API Routes
│   ├── api.py                   Main API endpoints
│   ├── auth.py                  Authentication routes
│   ├── booking.py               Booking management
│   ├── admin.py                 Admin endpoints
│   └── ...                      Other route modules
│
├── templates/                   📄 HTML Templates (if used)
├── static/                      🎨 Static Assets (if used)
└── utils/                       🔧 Utility Functions
