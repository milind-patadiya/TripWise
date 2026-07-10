# TripWise — Powerpoint Presentation Outline

Use this outline to structure your 10-15 minute final year defense presentation.

## Slide 1: Title Slide
- **Title**: TripWise - Enterprise AI Travel Planner
- **Subtitle**: Final Year Major Project
- **Your Name / Team Name**
- **Date**: 11 July 2026

## Slide 2: Problem Statement
- **The Problem**: Planning a trip is tedious and highly fragmented. Travelers must juggle separate tabs for flights, hotels, weather, and budgeting.
- **The Consequence**: Information overload, hidden costs, and poorly optimized itineraries.

## Slide 3: The TripWise Solution
- **The Concept**: A centralized, AI-driven travel ecosystem.
- **Core Pillars**:
  1. Automated AI Itinerary Generation
  2. Live Weather & Environmental Data
  3. Budget Tracking & Visualization
  4. Real-time Destination Discovery

## Slide 4: Key Features
- **Smart AI Planner**: Generates day-by-day JSON itineraries.
- **Dynamic Dashboards**: User & Admin control panels.
- **Offline Exports**: Client-side PDF generation for offline travel use.
- **Interactive Maps**: GPS-accurate Leaflet integrations.

## Slide 5: System Architecture
- **Frontend**: React, TypeScript, Zustand, TailwindCSS
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB
- *(Insert a diagram here showing Frontend -> Express -> MongoDB / External APIs)*

## Slide 6: API Integrations
- **Google Gemini**: For Natural Language Processing and Trip generation.
- **Open-Meteo**: For hyper-local weather tracking.
- **REST Countries**: For currency and timezone mapping.

## Slide 7: Challenges & Solutions
- **Challenge**: Bypassing strict browser CORS policies for weather data.
  - **Solution**: Built a secure Node.js proxy route to fetch data server-side.
- **Challenge**: AI Hallucinations returning broken text instead of JSON.
  - **Solution**: Engineered a strict prompt structure and built a "Smart Fallback Engine" to guarantee 100% uptime.

## Slide 8: Future Scope
- Integration with Amadeus GDS for live flight ticketing.
- Real payment processing via Stripe.
- Collaborative trip planning (multiplayer mode).

## Slide 9: Live Demonstration
- *(Switch to the browser and run through the Demo Flow detailed in your Project Report).*

## Slide 10: Conclusion & Q&A
- **Summary**: TripWise successfully demonstrates the power of integrating Generative AI into modern web applications to solve real-world logistical problems.
- **Thank You**.
