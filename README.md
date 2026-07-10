# TripWise - Enterprise AI Travel Planner ✈️

TripWise is a modern, enterprise-grade travel application that leverages AI to generate dynamic, personalized day-by-day itineraries. It features a complete booking ecosystem including destinations, hotel recommendations, budget tracking, and real-time weather integration.

## 🌟 Key Features
- **AI-Powered Itinerary Generation**: Uses Google Gemini (with a robust fallback engine) to craft personalized trips based on budget and preferences.
- **Smart Dashboard**: Track expenses, view upcoming trips, and get real-time weather updates for your destination.
- **Interactive Maps**: Explore destination maps using React Leaflet.
- **PDF Export**: Generate branded, downloadable PDF itineraries for offline use using `jsPDF`.
- **Admin Panel**: Manage users, packages, and destinations via a secure admin dashboard.

## 🛠️ Technology Stack
- **Frontend**: React 18, Vite, TypeScript, TailwindCSS, Zustand (State), React Query, Framer Motion (Animations), Recharts.
- **Backend**: Node.js, Express.js, Mongoose.
- **Database**: MongoDB.
- **APIs**: Open-Meteo (Weather), REST Countries, Google Gemini (AI).

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://localhost:27017`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TripWise
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Variables**
   Ensure your `server/.env` looks like this:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/tripwise
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_optional_gemini_key
   ```

5. **Seed the Database**
   This populates the database with real destinations, hotels, and the admin user.
   ```bash
   cd server
   npm run seed
   ```

6. **Start the Application**
   Run the following commands in two separate terminal windows:
   ```bash
   # Terminal 1: Backend
   cd server
   npm run dev

   # Terminal 2: Frontend
   cd client
   npm run dev
   ```

Access the app at `http://localhost:5173`.

## 👨‍💻 Default Credentials
- **Admin**: `admin@tripwise.com` / `admin123`
- **User**: `user@example.com` / `user123` (or register a new account)

## 📄 License
This project was built as a Final Year Major Project and is open-source under the MIT License.
