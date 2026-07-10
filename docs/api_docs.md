# TripWise API Documentation

Base URL: `http://localhost:5000/api`

## 1. Authentication (`/api/auth`)

### `POST /register`
- **Desc**: Register a new user
- **Body**: `{ name, email, password }`
- **Response**: `{ _id, name, email, token }`

### `POST /login`
- **Desc**: Authenticate a user
- **Body**: `{ email, password }`
- **Response**: `{ _id, name, email, token, role }`

## 2. Destinations (`/api/destinations`)

### `GET /`
- **Desc**: Get all destinations
- **Query Params**: `?limit=3`, `?search=goa`
- **Response**: Array of Destination Objects

### `GET /:id`
- **Desc**: Get a single destination by ID
- **Response**: Destination Object (includes coordinates and facts)

## 3. Hotels (`/api/hotels`)

### `GET /`
- **Desc**: Fetch hotel list (can be filtered by destination)
- **Response**: Array of Hotel Objects

## 4. AI Trip Planner (`/api/planner`)

### `POST /generate`
- **Desc**: Generate a day-by-day JSON itinerary using Gemini AI.
- **Headers**: `Authorization: Bearer <token>`
- **Body**: 
  ```json
  {
    "destination": "Goa",
    "days": 3,
    "travelers": 2,
    "budget": "Moderate",
    "interests": ["beaches", "nightlife"]
  }
  ```
- **Response**:
  ```json
  {
    "itinerary": {
      "budgetBreakdown": { "transport": 1000, ... },
      "packingList": ["Sunscreen", "Camera"],
      "days": [
        {
          "day": 1,
          "theme": "Arrival",
          "morning": "...",
          "afternoon": "...",
          "evening": "..."
        }
      ]
    }
  }
  ```

## 5. Trips (`/api/trips`)

### `GET /`
- **Desc**: Get all trips created by the logged-in user.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Array of Trip Objects

### `POST /`
- **Desc**: Save a newly generated itinerary to the user's dashboard.
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ title, destination, days, budget, itinerary }`

## 6. Weather Proxy (`/api/weather`)

### `GET /`
- **Desc**: Server-side proxy to Open-Meteo to fetch weather, bypassing browser CORS.
- **Query Params**: `?lat=28.61&lng=77.20`
- **Response**:
  ```json
  {
    "current_weather": { "temperature": 32, "weathercode": 1 },
    "daily": { ... }
  }
  ```

## 7. Admin (`/api/admin`)

### `GET /stats`
- **Desc**: Fetch application-wide metrics.
- **Headers**: `Authorization: Bearer <token>` (Must be Admin)
- **Response**: `{ totalUsers, totalTrips, totalDestinations }`
