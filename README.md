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
| User Auth DB | MongoDB (via Mongoose) |
| Core Data DB | PostgreSQL (via node-postgres) |
| Dev Databases | Docker + Docker Compose |

---

## 📁 Project Structure

```
inventory-system/
├── docker-compose.yml    ← Starts MongoDB + PostgreSQL containers
├── backend/              ← Express API (port 5000)
│   ├── server.js
│   ├── seed.js           ← Auto-creates tables and seeds sample data
│   ├── config/db.js
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
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (must be running)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/inventory-system.git
cd inventory-system
```

### 2. Start the databases
Make sure Docker Desktop is **open and running**, then:
```bash
docker compose up -d
```
This automatically starts PostgreSQL on port `5432` and MongoDB on port `27017`.

### 3. Start the backend
```bash
cd backend
npm install
npm start
```
On first run, the backend will automatically:
- Create all PostgreSQL tables
- Seed 3 raw materials (Steel Rod, Iron Sheet, Copper Wire)
- Seed 6 products (Steel Gate, Metal Frame, Steel Door, etc.)

### 4. Start the frontend
Open a **new terminal tab**:
```bash
cd frontend
npm install
npm run dev
```

The app will be available at **http://localhost:5173**

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

## 📦 Sample Data (Auto-seeded)

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

---

## 🛑 Stopping the Databases

```bash
docker compose down
```
