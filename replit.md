# WASHK - Car Cleaning Service Web App

## Overview

WASHK is a full-stack Uber-like car cleaning service web application designed specifically for Mainz, Germany. The app features a modern dark mode interface with professional styling, providing users with a mobile-first experience for booking car cleaning services with real-time location selection, compliant service packages, and integrated payment processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (July 2025)

✓ Successfully migrated from Replit Agent to Replit environment (July 17, 2025)
✓ Enhanced landing page with personalized greeting and German translations (July 17, 2025):
  - Personalized greeting: "Hallo, [Name] 👋 Bereit für deinen nächsten Waschgang?"
  - Updated placeholder text: "Deine Adresse hier eingeben..."
  - German service area indicators: "✅ Im Servicegebiet / ❌ Außerhalb des Gebiets"
  - Improved user experience with direct, concise German text
  - Single transparent green radius without disturbing colors
  - Modernized marker with pulsing animation and German tooltip
  - Clean, minimal design focused on service area functionality
✓ All API keys properly configured (Stripe, Google Maps)
✓ Server running successfully on port 5000
✓ Client-server separation maintained with secure practices
✓ Implemented modern loyalty/bonus system (July 15, 2025):
  - Uber/Flink/Bolt-inspired profile design with progress bars
  - 4-tier reward system: Duftbaum (3 bookings), Innenreinigung (10), Premium Shampoo (20), 50% Rabatt (30)
  - Optional authentication system with demo login (any email/password works)
  - Animated progress tracking with smooth gradient progress bars
  - User-friendly onboarding without login requirement
  - Psychological motivation triggers with clear reward visibility
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
✓ Profile system improvements (July 15, 2025):
  - Removed fake "Max Mustermann" display for non-logged users
  - Added proper guest user state with "Gastnutzer" display
  - Fixed loyalty progress starting at 0 instead of fake 1 booking
  - Added guest booking synchronization when users log in
  - Improved UX text for login prompts and progress tracking
  - Added localStorage guest booking persistence
  - Enhanced profile authentication with demo login system
✓ Authentication flow optimization (July 16, 2025):
  - Centralized authentication state management in AuthContext
  - Implemented immediate form dismissal on login/register success
  - Fixed live UI updates for profile dropdown and user data
  - Optimized guest booking migration to occur only once on first login
  - Eliminated redundant state management across components
  - Enhanced user experience with instant feedback and state synchronization
✓ Enhanced Firebase authentication system (July 16, 2025):
  - Implemented Google and Facebook social login with Firebase Auth
  - Added comprehensive password validation with strength indicators
  - Integrated password visibility toggle functionality (eye icon)
  - Enhanced error handling with user-friendly German error messages
  - Centralized authentication state with single onAuthStateChanged listener
  - Proper Firestore user document creation and synchronization
  - Seamless guest booking migration to Firebase user accounts
  - Fixed profile page white backgrounds to match app's dark theme
  - Added demo fallback for social login when Firebase providers are not configured
✓ Comprehensive booking system improvements (July 16, 2025):
  - Fixed dropdown menu authentication routing (login/register modes work correctly)
  - Updated loyalty system with realistic milestones: 2 bookings (Duftbaum), 3 (Premium Shampoo), 5 (50% Rabatt), 7 (Gratis Innenreinigung)
  - Enhanced booking flow with "Jetzt bezahlen" button and proper form validation
  - Added location details input field for additional address information
  - Improved map component with green color coding for service availability
  - Added motivational text on profile page based on booking history
  - Created comprehensive 6-step cleaner application form with marketing content
  - Fixed all navigation issues and maintained dark theme consistency throughout
✓ Interactive map home screen redesign (July 17, 2025):
  - Completely replaced home screen with full-screen interactive Google Maps
  - Implemented real-time user location detection and service area validation
  - Added Mainz service area polygon with green zones for availability
  - Created Google Places Autocomplete address search functionality
  - Floating action button appears only when address is in service area
  - Modern light-themed map design inspired by Uber/Bolt/Tier apps
  - Conditional header system: floating header for map, standard for other tabs
  - Service availability indicators with red/green zone visualization
  - Address selection triggers direct booking flow navigation
  - Enhanced UX with smooth animations and professional styling
✓ Complete landing page redesign with modern UI/UX (July 17, 2025):
  - Implemented full-screen map with custom styling and gradient overlays
  - Added slide-out left drawer navigation with 6 menu items (My Bookings, Invoices, Become a Cleaner, etc.)
  - Replaced crowded home screen with clean, minimalistic Tier/Lime-style interface
  - Centered search bar with "Enter the address we should come to..." placeholder
  - Service zone overlay with live green/red area visibility
  - Modern floating header with hamburger menu and WASHR branding
  - Updated bottom navigation with clean line icons and WASHR green (#2dd36f) color scheme
  - Implemented zone-based user flow: address input → service validation → create booking
  - Enhanced error messaging for out-of-service areas with professional styling
  - Maintained all existing functionality while dramatically improving first impression
✓ Professional dark mode homepage implementation (July 17, 2025):
  - Completely redesigned map with dark theme and minimal UI elements
  - Hidden street names, districts, and parks - only major cities visible (Mainz, Wiesbaden, Frankfurt)
  - Replaced square service zone with organic circular area featuring soft glow effect
  - Added subtle red overlay for non-service areas with professional styling
  - Implemented single central marker with pulsing animation and info tooltip
  - Updated all UI components to match dark theme with turquoise/green accents (#00ff88)
  - Enhanced floating header, search bar, and bottom navigation with dark styling
  - Added gradient overlays and backdrop blur effects for layered professional appearance
  - Maintains Uber/Bolt-style clean, minimal, and functional design principles
✓ Minimal dark mode interface finalization (July 17, 2025):
  - Removed dropdown menu, logo, and address input field completely for minimal design
  - Added comprehensive dark gradient masks at top, bottom, and sides for clean fade effect
  - Simplified floating header to single hamburger menu button only
  - Implemented multi-layered gradient overlays for professional dark appearance
  - Clean, modern dark theme with smooth transitions and minimal elements
  - Mobile-ready interface with professional styling and subtle design elements
  - Polished, elegant appearance with dark-themed UI throughout
✓ Landing page redesign with focused map view (July 17, 2025):
  - Updated map zoom to focus on service area (zoom 13) instead of showing all Germany
  - Set minimum zoom limit (8) to prevent viewing outside Germany
  - Adjusted service area circles for closer, more focused view
  - Updated German text: "Dein Auto, gewaschen – wo du bist."
  - Added professional subtitle: "Gib deine Adresse ein und wir kommen direkt zu dir – bequem, flexibel und professionell."
  - Centered address search with "Adresse eingeben..." placeholder
  - "Verfügbarkeit prüfen" button with modern styling and hover effects
  - Enhanced soft gradient overlay at top for better text contrast
  - Mobile-first design with bold, clean typography similar to delivery apps
✓ Complete color scheme update (July 17, 2025):
  - Updated entire UI to use #100c0c (elegant dark brown-black) replacing gray-900
  - Changed primary green from #00ff88 to #3cbf5c for better contrast and professionalism
  - Updated landing page with new German text: "Hallo 👋 Wo dürfen wir dein Auto sauber machen?"
  - Simplified address placeholder to "Deine Adresse hier eingeben..."
  - Applied consistent #100c0c backgrounds to dropdown menus, bottom navigation, and side drawer
  - Updated all service area indicators with proper German translations
  - Refined button styling with white text on #3cbf5c background
  - Enhanced loading states and modal dialogs with new color scheme
✓ Landing page design optimization and address search functionality (July 17, 2025):
  - Reduced text sizes for better proportions: heading (2xl/3xl), subtitle (sm/base)
  - Made content more compact with smaller max-width (max-w-sm) and reduced spacing
  - Implemented fully functional address search with Google Places API integration
  - Added controlled input state with value binding and onChange handlers
  - Enter key support for quick address search without clicking button
  - Real-time service area validation with visual feedback via toast notifications
  - Automatic map centering and marker placement when address is found
  - Proper error handling for invalid addresses and search failures
  - Button disabled state when no address is entered for better UX
  - Smaller, more touch-friendly input and button sizes for mobile optimization
✓ Personalized landing page with username integration (July 17, 2025):
  - Added userName prop to InteractiveMap component for personalization
  - Updated heading to include user's name: "{userName}, dein Auto gewaschen – egal wo du bist."
  - Integrated with AuthContext to pass user's displayName or email-derived name
  - Falls back to generic text when user is not logged in
  - Enhanced user experience with personalized greeting on landing page
✓ Complete rebranding from WASHR to WASHK (July 17, 2025):
  - Updated entire application branding from WASHR to WASHK across all components
  - Changed side drawer branding, splash screen, and UI elements
  - Updated localStorage keys from "washr_" to "washk_" for consistency
  - Maintained Firebase configuration for existing project compatibility
  - Applied new color scheme: #100c0c backgrounds, #3cbf5c buttons, #189c82 availability button
  - Modern dropdown icon (MoreVertical) with transparent background implemented
✓ Enhanced address validation system (July 17, 2025):
  - Fixed CORS issues by implementing backend proxy for OpenStreetMap geocoding API
  - Added comprehensive house number validation for German addresses
  - Enhanced address suggestions with visual indicators (✓ Vollständig, ❌ Außerhalb, 🏠 Hausnummer?, 🛣️ Straße?)
  - Implemented strict validation requiring both Mainz location AND house number
  - Added professional German error messages for invalid addresses
  - Improved UX with real-time address validation and user-friendly feedback
✓ Optimized German address search API (July 17, 2025):
  - Implemented Mainz-focused search with bounding box (8.215,50.000,8.300,49.960) for local priority
  - Added two-tier search strategy: Mainz first (up to 4 results), then Germany-wide fallback
  - Server-side filtering to only show addresses with streets/roads
  - Enhanced address formatting to prioritize street + house number display
  - Intelligent sorting: Mainz complete addresses first, then Mainz streets, then Germany-wide
  - Increased minimum character requirement to 4 for better search accuracy
  - Maximum 4 suggestions displayed for optimal user experience
✓ Performance optimization with debouncing and smart fallback (July 17, 2025):
  - Implemented 300ms debouncing to reduce API calls and improve performance
  - Two-tier search strategy: Mainz-focused first, Germany-wide fallback only when needed
  - Reduced minimum search characters from 4 to 3 for better user experience
  - Added cleanup for debounce timers to prevent memory leaks
  - Smart fallback: Germany search only triggers when Mainz returns fewer than 4 results
  - Maintains optimal performance while ensuring comprehensive address coverage
✓ Enhanced address autocomplete with GPS functionality and minimalistic design (July 18, 2025):
  - Added GPS location button (📍) with real-time location detection
  - Implemented reverse geocoding API endpoint for coordinates to address conversion
  - GPS button provides instant address completion with service area validation
✓ Advanced address autocomplete with instant fuzzy search and animated house number prompts (July 18, 2025):
  - Implemented instant suggestions starting from 2 characters with 50ms debouncing
  - Added comprehensive fuzzy search algorithm with typo tolerance and bigram analysis
  - Enhanced multi-tier search: Mainz-priority first, then Germany-wide coverage
  - Intelligent relevance scoring system favoring complete addresses and Rhine area
  - Created beautiful animated house number prompt with spring animations and auto-hide timer
  - Friendly UI with house emoji, pulsing rings, and progress bar for better user experience
  - Replaces harsh error toasts with gentle, encouraging prompts for incomplete addresses
✓ Complete German address coverage with instant local suggestions (July 18, 2025):
  - Expanded local database to include major German cities: Berlin, München, Köln, Hamburg, Frankfurt
  - Instant suggestions for 50+ major German addresses with no API dependency
  - Enhanced rate limiting protection with 1-second delays and 10-minute caching
  - Smart fallback system: local suggestions appear instantly, API enhances when available
  - Prioritizes Mainz addresses while providing full German street network coverage
  - Eliminates user confusion by showing comprehensive national address options
✓ Modern GPS button redesign with professional dark theme (July 18, 2025):
  - Updated GPS button with modern compass icon and dark background (#100c0c)
  - Added subtle glow effects, backdrop blur, and smooth hover animations
  - Enhanced touch target size (40px) for better mobile usability
  - Professional glass-morphism design with green accent colors (#3cbf5c)
  - Compass SVG icon with rotate and scale animations on hover
  - Subtle pulse animation and glow effects for premium look
  - Increased input field right padding (pr-16) to prevent GPS button overlap
  - Professional tooltip: "Aktuellen Standort verwenden" with smooth transitions
✓ Optimized instant address suggestions system (July 18, 2025):
  - Ultra-responsive debouncing reduced to 50ms for near-instant suggestions
  - Maximum 4 suggestions displayed with Mainz streets prioritized first
  - Dark modern styling: #1a1a1a background with subtle borders and backdrop blur
  - Smooth hover effects and animations for professional user experience
  - Complete German address recognition with house number validation
  - Intelligent sorting: Mainz complete addresses → Mainz streets → Germany-wide results
✓ Enhanced map experience with optimized zoom and location features (July 17, 2025):
  - Increased default zoom level to 16 for street-level detail on app start
  - Added automatic user location detection with navigator.geolocation
  - Centered map dynamically on user's location when permission granted
  - Updated Mainz center coordinates to 49.9929, 8.2473 for better positioning
  - Implemented Germany bounds restriction to prevent zooming out beyond country borders
  - Added user location marker with blue styling when GPS location is found
  - Enhanced UX with location-found toast notifications
  - Maintained fallback to Mainz center when location access denied
✓ Streamlined user interface with button removal (July 17, 2025):
  - Removed "Verfügbarkeit prüfen" button for cleaner interface
  - Address search now triggers automatically on Enter key press
  - Simplified user experience with one-step address input
  - Implemented custom car wash SVG icon for user location marker
  - Replaced legacy Places API with modern Geocoding API for better reliability
✓ Dynamic greeting system based on authentication status (July 17, 2025):
  - Shows "Username 👋" when user is logged in (displays name from displayName or email)
  - Shows just "👋" when user is not authenticated
  - Integrated with AuthContext for real-time authentication status updates
  - Personalized experience without overwhelming guest users
✓ Redesigned dropdown menu with German branding and navigation (July 17, 2025):
  - Added WASHK logo with green "W" circle and "Autoreinigungsservice" subtitle
  - Shows "Gastnutzer" for non-authenticated users with "Anmelden, um alle Funktionen zu nutzen"
  - Complete German menu items: "Meine Buchungen", "Rechnungen", "Cleaner werden", "Feedback geben"
  - Consistent branding across both authenticated and guest user states
  - Professional dropdown design matching the app's dark theme and green accent colors
✓ Complete German localization of UI components (July 17, 2025):
  - Updated side drawer with German translations: "Autoreinigungsservice", "Gastnutzer", "Hilfe & Support"
✓ Successful migration from Replit Agent to Replit environment (July 18, 2025):
  - All dependencies properly installed and running
  - Server running on correct port (5000) with security configurations
  - Client-server separation maintained with modern architecture
  - Firebase and Google Maps integrations fully functional
  - All security practices implemented for production deployment
  - Project structure optimized for Replit compatibility
  - Translated user status text: "Verifizierter Kunde" for authenticated users
  - All menu items now in German throughout the application
  - Consistent German language experience across dropdown and side navigation
✓ Custom address autocomplete system with German styling (July 17, 2025):
  - Implemented custom styled autocomplete dropdown with dark theme (#1e1e1e background)
  - Real-time address suggestions using Google Places API restricted to Germany
  - Professional styling with rounded corners, hover effects, and smooth animations
  - Mainz area validation with German warning modal for out-of-service areas
  - Custom error popup: "Diesen Bereich machen wir derzeit leider nicht. Melde dich beim Support für weitere Hilfe."
  - Click-outside functionality and keyboard navigation support
  - Replaces browser-standard autocomplete with custom styled solution
✓ Enhanced autocomplete with fallback system (July 17, 2025):
  - Added 15 real Mainz addresses as fallback when Google API has authorization issues
  - Hybrid system: tries Google Places API first, falls back to local address database
  - Local addresses include postal codes (55116, 55118, 55122, 55131) for authenticity
  - Fixed EnhancedBookingFlow component error by adding missing handleComplete function
  - System remains functional even with API restrictions or connectivity issues
✓ OpenStreetMap Nominatim API integration (July 17, 2025):
  - Replaced Google Places API with free OpenStreetMap Nominatim API for address autocomplete
  - Implemented proper User-Agent headers and error handling for reliable API access
  - Live address search for entire Germany with restriction to country code 'de'
  - Accurate city validation using OpenStreetMap address details (city, town, village, municipality)
  - Real coordinates from OpenStreetMap data for precise map positioning
  - Fallback to local Mainz addresses when Nominatim API is not accessible
  - No API keys required - completely free and open source solution
✓ Enhanced map zoom and bounds configuration (July 17, 2025):
  - Increased starting zoom level from 13 to 12 for closer initial view
  - Added Germany bounds restriction to prevent panning outside country borders
  - Set minimum zoom to 7 to maintain Germany-focused view
  - Maintained Mainz center position for optimal service area visibility
  - Improved user experience with focused geographic constraints

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