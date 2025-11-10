# CineVerse - Frontend Documentation

> **Note**: This is the frontend-specific documentation. For complete project setup, see [../README.md](../README.md)

Modern React + TypeScript frontend for the CineVerse cinema booking system.

## 🎯 Overview

This is the frontend application for CineVerse, featuring a dark theme with glassmorphism effects and a professional cinema booking experience.

## ✨ Features

- **Show Browsing**: Browse 4,200+ shows with filtering
- **Individual Seat Selection**: Pick exact seats (A1, B2, etc.)
- **Real-time Booking**: Instant seat availability updates
- **User Authentication**: Register and login
- **Booking History**: View and manage bookings
- **Admin Dashboard**: Revenue analytics and booking statistics
- **Responsive Design**: Works on all devices
- **Dark Theme**: Modern glassmorphism UI

## 🚀 Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Shadcn/ui components
- React Router v6
- Context API for state management

## 🔌 Backend Integration

The frontend connects to the Flask backend at:
- **API Base URL**: `http://localhost:5000/api`
- **CORS**: Configured for port 8080

## 🛠️ Setup

**See the main [README.md](../README.md) for complete setup instructions.**

Quick commands:
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on **http://localhost:8080/**

## 📦 Build

```bash
# Production build
npm run build
```

## 🔗 Links

- **Main Documentation**: [../README.md](../README.md)
- **Setup Guide**: [../docs/SETUP.md](../docs/SETUP.md)
- **System Summary**: [../docs/SYSTEM_SUMMARY.md](../docs/SYSTEM_SUMMARY.md)
- **Technical Docs**: [../docs/TECHNICAL_DOCUMENTATION.md](../docs/TECHNICAL_DOCUMENTATION.md)
- **All Documentation**: [../docs/DOCUMENTATION_INDEX.md](../docs/DOCUMENTATION_INDEX.md)
