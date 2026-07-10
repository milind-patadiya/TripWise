# How to Import the Database in MongoDB Compass

Follow these steps to import the pre-configured dummy data into your MongoDB database, so you can demonstrate the working functionality of TripWise (Booking, Admin Dashboard, Trips, User Dashboard).

## Prerequisites
- **MongoDB Compass** installed on your system.
- Your **MongoDB Connection String** (the `MONGO_URI` in `server/.env`).

## Step 1: Connect to MongoDB Compass
1. Open **MongoDB Compass**.
2. Paste your connection string (`MONGO_URI` from `server/.env`) into the URI field.
3. Click **Connect**.

## Step 2: Create the Database
1. Once connected, click the **+ (Create Database)** button next to the "Databases" heading on the left sidebar.
2. For **Database Name**, enter: `tripwise`
3. For **Collection Name**, enter: `users`
4. Click **Create Database**.

## Step 3: Import Data into Collections
Inside the `tripwise` database, you will now see the `users` collection. You need to create the other collections and import the corresponding JSON files located in the `server/data/mongodb-export/` folder.

For each of the collections below:
1. If the collection doesn't exist, click the **+** button next to the `tripwise` database name to create it.
2. Click on the collection name in the left sidebar to open it.
3. Click the **ADD DATA** button (usually green) in the center or top-right, and select **Import JSON or CSV file**.
4. Browse to `server/data/mongodb-export/` and select the corresponding JSON file.
5. Make sure the format is set to **JSON**, and click **Import**.

### Collections to Create and Import:
- **`users`** -> Import `users.json`
- **`destinations`** -> Import `destinations.json`
- **`hotels`** -> Import `hotels.json`
- **`attractions`** -> Import `attractions.json`
- **`packages`** -> Import `packages.json`
- **`bookings`** -> Import `bookings.json`
- **`trips`** -> Import `trips.json`
- **`notifications`** -> Import `notifications.json`

## Step 4: Verify
1. Make sure all collections contain data.
2. In the `users` collection, you should see two users:
   - Admin: `admin@tripwise.com`
   - Traveler: `traveler@tripwise.com`
3. Run the backend server (`npm start` or `node server.js` in the `server` folder).
4. Run the frontend (`npm run dev` in the `client` folder).
5. Log in as `traveler@tripwise.com` (password: `Traveler@123`) to see the populated dashboard.

You're all set! The full end-to-end functionality of TripWise is now ready for your demo.
