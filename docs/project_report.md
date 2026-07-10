# TripWise — Project Report Documentation

## 1. Project Synopsis
TripWise is a comprehensive, enterprise-grade travel management system that integrates generative AI to automatically craft customized day-by-day travel itineraries. The system solves the modern traveler’s dilemma of fragmented trip planning by centralizing destination discovery, weather forecasting, hotel recommendations, budget tracking, and itinerary generation into a single intuitive platform.

## 2. Technology Stack
The project is built on the **MERN** stack, augmented with modern tooling for a premium experience.

### Frontend
- **Framework**: React.js 18 + Vite (for lightning-fast HMR)
- **Language**: TypeScript (for type safety and fewer runtime errors)
- **Styling**: Tailwind CSS (Utility-first styling, minimal dark/light themes)
- **State Management**: Zustand (Global state for Auth and UI)
- **Data Fetching**: `@tanstack/react-query` & `axios`
- **Animations**: Framer Motion
- **Maps & Charts**: React Leaflet & Recharts
- **PDF Generation**: `jspdf` & `jspdf-autotable`

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **External API Proxy**: `axios` (used on the server to bypass CORS for weather data)

## 3. External APIs Integration
1. **Google Gemini (Generative Language API)**
   - **Usage**: Automatically generates dynamic, day-by-day JSON itineraries based on user constraints (budget, days, destination). 
   - **Fallback Mechanism**: A built-in robust offline engine intercepts requests and serves pre-compiled expert itineraries if the API key fails.
2. **Open-Meteo API**
   - **Usage**: Fetches live, hyper-local weather data for the user's dashboard and destination pages based on GPS coordinates. Handled server-side to prevent CORS issues.
3. **Unsplash Source (via Database Seeding)**
   - **Usage**: Provides beautiful, high-quality dynamic imagery for destinations and hotels.
4. **REST Countries API**
   - **Usage**: Fetches country-specific metadata (currency, timezone) for destination detail pages.

## 4. Final Folder Structure
```text
TripWise/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── api/                # Axios interceptors & config
│   │   ├── components/         # Reusable UI (Navbar, SplashScreen, etc.)
│   │   ├── layouts/            # AuthLayout, DashboardLayout
│   │   ├── pages/              # Public, Dashboard, Planner, and Admin pages
│   │   ├── store/              # Zustand global stores
│   │   ├── utils/              # Utilities (generatePdf.ts, cn.ts)
│   │   └── App.tsx             # React Router configuration
│   ├── index.html
│   ├── eslint.config.js
│   └── package.json
│
└── server/                     # Backend API
    ├── data/
    │   └── seed.js             # Master database population script
    ├── middleware/             # JWT Auth protection
    ├── models/                 # Mongoose schemas (User, Trip, Destination)
    ├── routes/                 # Express route handlers
    │   ├── ai.js               # Chatbot logic
    │   ├── planner.js          # Itinerary generation logic
    │   └── weather.js          # Open-Meteo proxy
    ├── server.js               # Application entry point
    └── .env                    # Secrets & API Keys
```

## 5. Demo Flow (For July 11th Presentation)
1. **Introduction**: Start by showing the Splash Screen and Landing Page. Highlight the clean, minimal aesthetic.
2. **Authentication**: Register a new user to show the JWT token generation in action.
3. **Core Feature - AI Planner**: 
   - Click "AI Planner".
   - Select a destination (e.g., Goa), 3 days, and "Luxury" budget.
   - Wait for the spinner to finish, then showcase the generated Itinerary UI.
   - **Crucial Step**: Click **"Export PDF"** to download the professional `jsPDF` itinerary and open it for the professors.
4. **Data Visualization**: Navigate to the User Dashboard to show the live Open-Meteo weather widget, and click into "Expenses" to show the Recharts pie chart.
5. **Admin Control**: Log out, and log back in as `admin@tripwise.com` to demonstrate the Admin Dashboard and metric overview.

## 6. Project Report Outline
1. **Abstract**
2. **Introduction** (Problem Statement, Objectives, Scope)
3. **Literature Review** (Existing systems vs. TripWise)
4. **System Architecture** (MERN Stack Data Flow, API Integrations)
5. **Implementation Details** (Frontend components, Backend schemas, AI Fallback engine)
6. **Results & Screenshots** (Include screenshots from the verified walkthrough)
7. **Conclusion & Future Scope** (Adding real Stripe payment gateways, integrating airline booking APIs).
