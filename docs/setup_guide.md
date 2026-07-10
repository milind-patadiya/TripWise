# TripWise Documentation Manuals

## 1. Installation Guide
TripWise is designed to be easily deployable on any modern Windows, Mac, or Linux environment.

**Prerequisites:**
- Node.js (v18.x or higher)
- MongoDB Community Server (Running on default port `27017`)
- Git

**Step 1: Clone and Install**
1. Extract the `TripWise` project folder to your local machine.
2. Open two terminal windows.
3. In Terminal 1, navigate to the `server` directory and run `npm install`.
4. In Terminal 2, navigate to the `client` directory and run `npm install`.

**Step 2: Environment Configuration**
Ensure the `server/.env` file contains the required keys:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/tripwise
JWT_SECRET=super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key (Optional: system uses smart fallback if omitted)
```

**Step 3: Database Seeding**
In the `server` terminal, run:
`npm run seed`
This will populate the database with default destinations, hotels, attractions, and the Admin user.

**Step 4: Booting the Application**
1. In Terminal 1 (server): `npm run dev`
2. In Terminal 2 (client): `npm run dev`
3. Access the application at `http://localhost:5173`.

---

## 2. User Manual
**Getting Started as a Traveler**
1. **Registration**: Click "Get Started" on the landing page. Fill out your Name, Email, and Password.
2. **Dashboard Overview**: Once logged in, your dashboard displays a live weather feed for your current location (defaulted to New Delhi), your upcoming trips, and recommended destinations.
3. **Planning a Trip**:
   - Click the **"AI Planner"** quick action.
   - Enter your Source and Destination.
   - Select the number of days, travelers, and travel style.
   - Click **Generate Itinerary**. The AI will take roughly 5-10 seconds to compile your trip.
4. **Exporting the Itinerary**: On the generated timeline view, click the **"Export PDF"** button in the top right. A professional, multi-page PDF will download to your device for offline viewing.
5. **Managing Budget**: Navigate to "Expenses" on the sidebar to add manual expenses and view a visual breakdown of your trip costs.

---

## 3. Admin Manual
**System Administration**
1. **Admin Login**: Access the login page and use the seeded admin credentials (`admin@tripwise.com` / `admin123`).
2. **Dashboard Overview**: The Admin Dashboard provides an overarching view of platform metrics: Total Users, Total Revenue (Simulated), and Total Trips Generated.
3. **User Management**: Navigate to the "Users" tab to view a list of all registered accounts on the platform.
4. **Content Management**: Navigate to the "Destinations" tab to oversee the MongoDB records for all locations available on the platform. 

*Note: As this is v1.0.0, adding new destinations requires modifying the backend `seed.js` script or interacting directly via MongoDB Compass.*
