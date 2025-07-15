# WASHR - Car Cleaning Service Web App

## Overview

WASHR is a full-stack Uber-like car cleaning service web application designed specifically for Mainz, Germany. The app features a modern dark mode interface with professional styling, providing users with a mobile-first experience for booking car cleaning services with real-time location selection, compliant service packages, and integrated payment processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (July 2025)

✓ Successfully migrated from Replit Agent to Replit environment
✓ All API keys properly configured (Stripe, Google Maps)
✓ Server running successfully on port 5000
✓ Client-server separation maintained with secure practices
✓ Updated service packages to match new German structure:
  - Außenreinigung (39€): Handwäsche ohne Hochdruckreiniger
  - Innenreinigung (35€): Komplette Innenraumpflege
  - Innen & Außen (59€): Rundum-Pflege Kombipaket
  - Premium (80€): Exklusivität nur für Privatgrundstücke
✓ Implemented comprehensive add-ons system:
  - Duftbaum (3€), Kofferraum intensiv (5€), Spiegel innen (4€)
  - Innenraum-Desinfektion (8€), Tierhaare entfernen (10€)
  - Live price calculation with selected add-ons
✓ Enhanced booking flow with 4-5 step process including add-ons selection
✓ Added splash screen animation with WASHR branding
✓ Improved trust indicators with modern emoji-based design
✓ Enhanced profile dropdown with click-outside functionality
✓ Updated booking area to show service packages when empty
✓ Integrated direct support contact via washr.mainz@gmail.com
✓ Enhanced legal content system in profile dropdown:
  - Individual modal pages for Impressum, Datenschutzerklärung, AGB, Widerrufsrecht
  - Professional German legal text content with proper formatting
  - Navigable interface with back buttons and scroll areas
  - Emoji icons for visual identification
✓ Comprehensive mobile optimization (July 15, 2025):
  - Touch-optimized interface with 44px minimum touch targets
  - Safe area support for notched devices and iOS/Android status bars
  - Mobile-first responsive design with optimized spacing and typography
  - Prevented zoom on input fields (16px font size minimum)
  - Enhanced button accessibility with proper mobile touch feedback
  - Optimized header size and spacing for small screens
  - Modal dialogs adapted for mobile with bottom-sheet style
  - Improved bottom navigation with better touch feedback
  - Added mobile-specific CSS classes for consistent behavior
  - PWA-ready optimizations for standalone app mode
✓ User authentication system integration (July 15, 2025):
  - Complete login/logout functionality with localStorage persistence
  - Dynamic profile dropdown adapting to authentication state
  - Mobile-optimized login form with proper touch targets
  - User-specific profile data generation from email addresses
  - Session management with welcome/goodbye toast notifications
  - Seamless integration with existing ProfilePage component
  - Demo mode allowing any email/password combination for testing
  - Secure local storage handling for user sessions
✓ Major UX improvements (July 15, 2025):
  - Direct package selection without "Weiter" button (Uber-style instant flow)
  - Smart add-on filtering to prevent redundant options (no duplicate services)
  - Interactive demo map with modern floating card design
  - Uber/Bolt-inspired visual design with rounded corners and gradients
  - Enhanced package cards with hover effects and improved typography
  - Optimized for resource conservation on Replit Free Plan
  - Eliminated gray map issue with functional demo implementation
✓ Final UX updates (July 15, 2025):
  - Auto-advance vehicle selection (instant progression like Uber)
  - License plate auto-progression after 4-5 characters with skip option
  - Simplified add-ons: Only relevant "Felgenreinigung & Detailpflege" (3.99€) for exterior
  - Optimized date picker with 2025 pre-selection and disabled past dates
  - Modern mobile-first touch targets (44px minimum) and typography
  - Complete Uber/Bolt/Flink-style UX with smooth animations and instant feedback

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Animations**: Framer Motion for smooth UI transitions
- **Mobile-First Design**: Responsive design optimized for mobile devices

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Build System**: Vite for development and production builds
- **Development**: tsx for TypeScript execution in development

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema**: Centralized schema definition in `shared/schema.ts`
- **Storage Interface**: Abstracted storage layer supporting both database and in-memory implementations

## Key Components

### Core Features
1. **Interactive Map**: Google Maps integration for location selection
2. **Service Packages**: Three tiered cleaning packages (Außenwäsche, Innen + Außen, Komplett)
3. **Vehicle Management**: Support for multiple vehicle types (Kleinwagen, Mittelklasse, SUV, Transporter)
4. **Booking System**: Multi-step booking process with date/time selection
5. **Payment Integration**: Stripe payment processing with wallet system
6. **Mobile Navigation**: Bottom navigation bar with 5 main sections

### UI Components
- **Responsive Design**: Mobile-first approach with sticky bottom navigation
- **Component Library**: shadcn/ui components for consistent styling
- **Form Handling**: React Hook Form with Zod validation
- **Toast Notifications**: User feedback system for actions
- **Modal System**: Booking flow and service area warnings

### Service Areas
- **Geographic Restriction**: Service limited to Mainz area
- **Location Validation**: Automatic detection of service area boundaries
- **GPS Integration**: Current location detection with fallback options

## Data Flow

### Booking Process
1. User selects location via map or GPS
2. User chooses service package
3. Multi-step modal guides through:
   - Vehicle selection
   - Location confirmation
   - Date/time selection
   - Payment method choice
   - Optional discount code entry
4. Booking created with status tracking
5. Real-time updates on booking status

### Payment Processing
- **Stripe Integration**: Secure payment processing
- **Wallet System**: Virtual wallet for credits and payments
- **Dual Payment Options**: Stripe checkout or wallet balance
- **Transaction Tracking**: Complete payment history

### Data Storage
- **Bookings**: Complete booking lifecycle management
- **Vehicles**: User vehicle information and history
- **Wallet Transactions**: Financial transaction records
- **Cleaner Applications**: Job application processing
- **Discount Codes**: Promotional code system

## External Dependencies

### Third-Party Services
- **Google Maps API**: Interactive maps and location services
- **Stripe**: Payment processing and financial transactions
- **Neon Database**: PostgreSQL hosting for production

### API Keys Configuration
- Stripe Public Key: `pk_test_51RktpI2e1akrsv2T...` (test mode)
- Stripe Secret Key: `sk_test_51RktpI2e1akrsv2T...` (test mode)
- Google Maps API: `AIzaSyC5P2v27x6bQrLvJUeA9T1lyrc3bvRtx9A`

### Development Dependencies
- **TypeScript**: Type safety and development experience
- **ESLint/Prettier**: Code quality and formatting
- **Vite**: Fast development server and build tool
- **PostCSS**: CSS processing with Tailwind

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite compiles React app to static assets
2. **Backend Build**: esbuild bundles Express server
3. **Database Migration**: Drizzle handles schema migrations
4. **Environment Configuration**: Separate development and production configs

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `VITE_STRIPE_PUBLIC_KEY`: Stripe public key for client
- `NODE_ENV`: Environment specification

### Production Considerations
- **Static Asset Serving**: Express serves built frontend assets
- **Database Pooling**: Connection management for serverless environments
- **Error Handling**: Comprehensive error boundaries and logging
- **Security**: CORS configuration and input validation

### Local Development
- **Hot Module Replacement**: Vite HMR for rapid development
- **Database Seeding**: Development data initialization
- **API Mocking**: In-memory storage for development/testing
- **Live Reload**: Automatic server restart on backend changes

The application uses a monorepo structure with shared TypeScript definitions between frontend and backend, ensuring type safety across the entire stack. The mobile-first design approach prioritizes touch interactions and responsive layouts suitable for the target German market in Mainz.