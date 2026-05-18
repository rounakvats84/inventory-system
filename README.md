# 🏭 Smart Inventory & Order Fulfillment System

A full-stack web application for managing finished product inventory, tracking raw materials, accepting customer orders, and automatically calculating estimated delivery times, costs, and profits.

---

## 🧠 How It Works

When an order is placed:
1. The system looks up the **recipe** for each ordered product (which raw materials and how many)
2. Compares required quantities against **current inventory**
3. If stock is short → uses available stock first, **procures only the shortage**
4. Calculates **ETA** = Procurement Wait Time + Production Time + Delivery Time
5. Calculates **Revenue, Cost, and Profit** automatically

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB (via Mongoose) |

---

## 📁 Project Structure

```
inventory-system/
├── backend/              ← Express API (port 5000)
│   ├── server.js         ← App entry point
│   ├── seed.js           ← Auto-seeds sample data into MongoDB on startup
│   ├── config/db.js      ← MongoDB connection logic
│   ├── models/           ← Mongoose models
│   ├── controllers/      ← Business logic
│   └── routes/           ← API endpoints
└── frontend/             ← React app (port 5173)
    └── src/
        ├── pages/        ← Login, Dashboard, Products, Inventory
        └── components/   ← Layout, Sidebar
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) v18 or higher
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on port `27017`. 

*(Note: There is no Docker or PostgreSQL required for this setup.)*

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/inventory-system.git
cd inventory-system
```

### 2. Start the Backend server (and Seed Data)
The backend uses a local MongoDB instance. **Ensure MongoDB is running on your system.**
When you start the server, `seed.js` will automatically run and populate the MongoDB database with sample raw materials and products if they don't already exist.

Open your terminal:
```bash
cd backend
npm install
npm start
```
The backend will run on `http://localhost:5000`. You will see messages confirming MongoDB is connected and the seed script has executed.

### 3. Start the Frontend app
Open a **new terminal window/tab**:
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at **http://localhost:5173**

---

## 👥 User Roles

| Role | Access |
|---|---|
| **Admin** | Dashboard, Products, Inventory management, Profit analytics |
| **Customer** | Dashboard (own orders only), Products (place orders) |

> Register a new account and select **Admin** to see all features.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |
| GET | `/api/products` | List all products with recipes |
| POST | `/api/orders` | Place an order (runs ETA + cost logic) |
| GET | `/api/orders` | Get all orders |
| GET | `/api/inventory` | Get all raw materials |
| PATCH | `/api/inventory/update` | Update stock quantities |

---

## 📦 Sample Data (Auto-seeded by seed.js)

### Raw Materials
| Material | Qty | Unit Cost | Procurement Time |
|---|---|---|---|
| Steel Rod | 100 | ₹50 | 2 days |
| Iron Sheet | 200 | ₹30 | 1 day |
| Copper Wire | 50 | ₹80 | 3 days |

### Products
| Product | Price | Production | Delivery |
|---|---|---|---|
| Steel Gate | ₹5,000 | 2 days/unit | 1 day |
| Metal Frame | ₹3,000 | 1 day/unit | 1 day |
| Steel Door | ₹7,000 | 2 days/unit | 1 day |
| Industrial Pipe | ₹2,000 | 1 day/unit | 1 day |
| Reinforced Beam | ₹8,000 | 3 days/unit | 2 days |
| Metal Container | ₹10,000 | 3 days/unit | 2 days |

---

## 🔄 Order Status Flow

```
PENDING → WAITING_FOR_MATERIAL (if stock short) → IN_PRODUCTION → COMPLETED
```
