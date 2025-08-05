# MOOG Comic Binder - Preorder Landing Page

## Overview

MOOG Comic Binder is a mobile-first preorder landing page for a comic project. The application features a dark-themed, animated landing page with a countdown timer to August 24, 2025, email lead capture functionality, and integration with Gumroad for preorders. The system is designed to capture potential customer emails while providing a seamless path to purchase through Gumroad's embedded checkout system.

### Recent Updates (August 2025)
- **3D Interactive Comic Cover**: Added realistic 3D rotation effect that follows mouse/touch movement with enhanced shadows and smooth animations
- **Migration to Replit Environment**: Successfully migrated from SQLite to PostgreSQL, configured proper Flask deployment with Gunicorn
- **Mobile Optimization**: Enhanced touch support for 3D interactions on mobile devices

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend uses a traditional server-side rendered approach with Flask templates, enhanced with client-side JavaScript for interactivity:

- **Template Engine**: Jinja2 templates served by Flask
- **Styling Framework**: Bootstrap 5 for responsive design with custom CSS for comic-themed dark styling
- **JavaScript**: Vanilla JavaScript for countdown timer, animations, and form handling
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Animation System**: CSS animations and JavaScript-driven effects for comic cover, countdown timer, and page elements
- **3D Interactive Effects**: Real-time 3D rotation of comic cover using CSS transforms and JavaScript pointer tracking

### Backend Architecture
The backend follows a simple Flask application pattern with clear separation of concerns:

- **Web Framework**: Flask with blueprint-style route organization
- **Database ORM**: SQLAlchemy with declarative models
- **Application Structure**: Modular design with separate files for models, routes, and app configuration
- **Error Handling**: Comprehensive logging and error handling for lead capture
- **Session Management**: Flask sessions with configurable secret key

### Data Storage
The application uses PostgreSQL for scalability and production readiness:

- **Database**: PostgreSQL with single table design for lead storage
- **Schema**: Simple leads table with id, gmail, and timestamp fields
- **Data Validation**: Server-side email validation requiring Gmail addresses
- **Duplicate Prevention**: Database-level checks to prevent duplicate email entries

### Lead Capture System
The email capture system is designed to be non-intrusive and optional:

- **Optional Collection**: Users can proceed to purchase without providing email
- **Gmail Validation**: Restricts email collection to Gmail addresses only
- **Duplicate Handling**: Prevents duplicate entries while logging attempts
- **Graceful Degradation**: Form submission works with or without JavaScript

## External Dependencies

### Third-Party Services
- **Gumroad**: E-commerce platform for handling preorders and payments via embedded overlay
- **Google Fonts**: Typography fonts (Bangers and Comic Neue) for comic-themed styling

### Frontend Libraries
- **Bootstrap 5.3.0**: CSS framework for responsive design and components
- **Font Awesome 6.4.0**: Icon library for UI elements
- **Gumroad.js**: Official Gumroad JavaScript library for embedded checkout

### Python Dependencies
- **Flask**: Web application framework
- **Flask-SQLAlchemy**: ORM for database operations
- **Werkzeug**: WSGI utilities including ProxyFix middleware
- **SQLAlchemy**: Core database toolkit

### Development Dependencies
- **Logging**: Python's built-in logging module for debugging and monitoring
- **DateTime**: Python's datetime module for timestamp management