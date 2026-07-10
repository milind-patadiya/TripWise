# TripWise — Viva Preparation & Q&A

Review these questions to confidently answer your professors during the defense.

## Core Technical Questions

**Q1: What technology stack did you use and why?**
*Answer:* I used the MERN stack (MongoDB, Express, React, Node.js) with TypeScript. I chose React for its component-based architecture and Vite for fast builds. TypeScript was used to catch errors during development. I also integrated TailwindCSS because it allows for rapid UI prototyping without writing custom CSS files.

**Q2: How does the AI Trip Planner actually work?**
*Answer:* The frontend collects the user's parameters (destination, budget, days) and sends them to the Node.js backend. The backend constructs a highly specific prompt and sends it to the Google Gemini AI API, instructing it to return the response in a strict JSON format. The backend then parses this JSON and sends it to the frontend, which maps it onto the UI timeline.

**Q3: What happens if the AI API goes down or rate-limits you during the presentation?**
*Answer:* I anticipated this issue and built a **Smart Fallback Engine**. If the API fails or no key is provided, the backend automatically intercepts the request and serves a pre-computed, highly detailed JSON itinerary from a local knowledge base (e.g., for Goa, Jaipur, etc.). This ensures the application is completely robust and never crashes.

**Q4: How did you implement the weather feature? Why not call Open-Meteo directly from the frontend?**
*Answer:* I built a dedicated `/api/weather` proxy route in the Node.js backend. If I called Open-Meteo directly from the React frontend, the browser would block the request due to CORS (Cross-Origin Resource Sharing) policies. By making the request from the server, I bypass CORS and keep my frontend secure.

**Q5: How is authentication handled?**
*Answer:* We use JWT (JSON Web Tokens). When a user logs in, the backend encrypts their password using `bcryptjs`, verifies it, and signs a JWT with a secret key. This token is sent to the frontend and stored in a Zustand global state manager. Every subsequent API request (like saving a trip) attaches this token in the Authorization header.

**Q6: Where is the data coming from on the Destinations and Hotels pages?**
*Answer:* The data is fetched dynamically from a local MongoDB database. I wrote a `seed.js` script that populated the database with real GPS coordinates, descriptions, and Unsplash image URLs so the platform looks realistic.

**Q7: How did you generate the PDF itinerary?**
*Answer:* I used `jsPDF` and `jspdf-autotable`. The frontend takes the JSON itinerary data, passes it into a utility function, and programmatically draws the text and tables onto a PDF canvas in the browser before triggering a download. It happens entirely client-side without needing a heavy backend PDF engine.

**Q8: What is the most challenging part of this project?**
*Answer:* Managing the asynchronous state and ensuring the AI API returned strict JSON instead of plain text. (If the AI returns conversational text, the `JSON.parse()` on the frontend crashes). I solved this by strictly engineering the backend prompt and building the fallback engine.

**Q9: If you had 3 more months, what would you add?**
*Answer:* I would integrate a real payment gateway like Stripe or Razorpay for actual bookings, and connect to a real global GDS (Global Distribution System) API like Amadeus for live flight and train ticket pricing.
