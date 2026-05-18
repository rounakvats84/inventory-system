# Backend API (Inventory System)

## Local Setup for Cross-Computer Compatibility

We have configured the backend to use an in-memory MongoDB server (`mongodb-memory-server`) that persists data locally without needing Docker or a separate system-level MongoDB installation! This ensures the code runs smoothly on any teammate's computer just by pulling the repository.

### Step 1: Install Dependencies
First, ensure you have Node.js installed on your system. Open your terminal, navigate to this folder (`backend/`), and run:
```bash
npm install
```
*(This will download `mongoose`, `express`, and all other necessary packages required to run the backend)*

### Step 2: Start the Local Database
In your terminal (inside the `backend` folder), run:
```bash
npm run db
```
**Do not close this terminal!** This starts a local MongoDB instance on port 27017. The database files will be saved in the `mongodb-data` folder (which is ignored by Git).

### Step 3: Seed the Database (Required on First Run or for Resetting)
Open a **new terminal tab**, navigate back to the `backend` folder, and run the seed script. This will drop any existing data and recreate the initial Raw Materials, Products, and the default Admin account:
```bash
node force-seed.js
```

### Step 4: Start the API Server
In the same terminal where you ran the seed script, start the Express server:
```bash
npm start
```
The backend will now be running on `http://localhost:5000`.

---

### Troubleshooting
- **"Invalid Credentials" or Auth Errors**: Ensure you have successfully run `node force-seed.js`.
- **Database Connection Errors (`ECONNREFUSED`)**: Make sure you have the database running (`npm run db`) in a separate, active terminal *before* starting the server or running the seed script.
