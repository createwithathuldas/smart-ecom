# SmartShop — E-Commerce Platform

**Assignment — Cloud Computing | MCA, LEAD College Palakkad**

A full-stack e-commerce platform combining a React frontend with a Python microservices backend. The system simulates a real-world checkout pipeline — product browsing, cart management, discount application, and payment processing — with asynchronous event messaging via RabbitMQ, all containerized with Docker.

---

## Table of Contents

1. [Repository Structure](#repository-structure)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Checkout Flow](#checkout-flow)
5. [Getting Started](#getting-started)
6. [Backend API Reference](#backend-api-reference)
7. [Frontend Pages](#frontend-pages)
8. [Discount Codes](#discount-codes)
9. [Author](#author)

---

## Repository Structure

This repository is organized into two primary components:

```text
smart-ecommerce/
├── backend/
│   ├── cart-service/               # Cart management microservice
│   │   ├── app.py                  # Add items, view cart
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   ├── db-init/
│   │   └── init.sql                # Database schema and seed data
│   ├── discount-service/           # Coupon and discount logic
│   │   ├── app.py
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   ├── inventory-service/          # Product and stock management
│   │   ├── app.py
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   ├── payment-service/            # Payment processing and RabbitMQ publisher
│   │   ├── app.py
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   └── screenshots/
│
└── frontend/
    ├── public/
    ├── screenshots/
    └── src/
        ├── assets/
        ├── components/             # Shared UI components (Navbar, etc.)
        └── pages/                  # Route-level page components
```

---

## System Architecture

### Infrastructure Layout

```text
+------------------------------------------------------------------------+
|                          Docker Network                                |
|                                                                        |
|  +------------------+    +------------------+    +-----------------+  |
|  | Inventory Service|    |   Cart Service   |    | Discount Service|  |
|  |   port: 5001     |    |   port: 5002     |    |   port: 5003    |  |
|  | Product & Stock  |    | Add/View Items   |    | Coupon Logic    |  |
|  +------------------+    +------------------+    +-----------------+  |
|                                                                        |
|           +------------------+    +-------------------+               |
|           | Payment Service  |    |     RabbitMQ      |               |
|           |   port: 5004     |--->|   port: 5672      |               |
|           | Process & Notify |    | Event Messaging   |               |
|           +------------------+    +-------------------+               |
|                    |                                                   |
|           +------------------+                                        |
|           |      MySQL       |                                        |
|           |   port: 3306     |                                        |
|           | Persistent Store |                                        |
|           +------------------+                                        |
+------------------------------------------------------------------------+

                        React Frontend
                          port: 5173
                              |
          +---------+---------+---------+---------+
          |         |         |         |         |
       :5001     :5002     :5003     :5004
     Inventory   Cart    Discount  Payment
```

### Request Lifecycle

1. **Browse** — Frontend fetches product listings from the Inventory Service.
2. **Add to Cart** — Cart Service stores selected items per session.
3. **Apply Discount** — Discount Service validates coupon code and returns adjusted price.
4. **Process Payment** — Payment Service records the transaction in MySQL and publishes a `payment_processed` event to RabbitMQ.
5. **Inventory Update** — Stock levels are decremented in the Inventory Service following a confirmed payment.
6. **Order Confirmation** — Frontend displays the order summary and confirmation to the user.

---

## Technology Stack

### Backend

| Component | Technology | Version |
|---|---|---|
| API Framework | Python + Flask | 3.11 |
| Database | MySQL | 8.0 |
| Message Broker | RabbitMQ | 3 |
| Containerization | Docker | Latest |

### Frontend

| Component | Technology | Version |
|---|---|---|
| UI Framework | React | 18 |
| Build Tool | Vite | 8 |
| Styling | Tailwind CSS | 4 |
| Routing | React Router DOM | Latest |
| HTTP Client | Axios | Latest |

---

## Checkout Flow

```text
Browse Products → Add to Cart → Apply Discount → Fill Delivery Details → Order Confirmed
```

Each step maps to a dedicated microservice interaction:

| Step | Service | Port |
|---|---|---|
| Browse products | Inventory Service | 5001 |
| Add to cart | Cart Service | 5002 |
| Apply discount code | Discount Service | 5003 |
| Process payment | Payment Service | 5004 |
| Async order event | RabbitMQ | 5672 |

---

## Getting Started

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Docker Desktop | 20.0+ | Must be running before starting |
| Node.js | 18+ | Required for frontend development |
| Postman | Any | Optional, for direct API testing |

### 1. Clone the Repository

```bash
git clone https://github.com/createwithathuldas/smart-ecommerce.git
cd smart-ecommerce
```

### 2. Create the Docker Network

```bash
docker network create ecommerce-net
```

### 3. Start Infrastructure Services

```bash
docker run -d --name mysql-db --network ecommerce-net \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -e MYSQL_DATABASE=ecommerce \
  -p 3306:3306 mysql:8.0

docker run -d --name rabbitmq --network ecommerce-net \
  -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

### 4. Initialize the Database

```bash
docker exec -i mysql-db mysql -uroot -proot123 < backend/db-init/init.sql
```

### 5. Build and Start All Backend Services

```bash
docker build -t inventory-service ./backend/inventory-service
docker run -d --name inventory --network ecommerce-net -p 5001:5001 inventory-service

docker build -t cart-service ./backend/cart-service
docker run -d --name cart --network ecommerce-net -p 5002:5002 cart-service

docker build -t discount-service ./backend/discount-service
docker run -d --name discount --network ecommerce-net -p 5003:5003 discount-service

docker build -t payment-service ./backend/payment-service
docker run -d --name payment --network ecommerce-net -p 5004:5004 payment-service
```

### 6. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### 7. Verify All Services

```bash
docker ps
```

| Container | Port | Purpose |
|---|---|---|
| mysql-db | 3306 | Database |
| rabbitmq | 5672, 15672 | Message broker |
| inventory | 5001 | Product and stock API |
| cart | 5002 | Cart management API |
| discount | 5003 | Coupon validation API |
| payment | 5004 | Payment processing API |
| Frontend | 5173 | React UI |
| RabbitMQ Dashboard | 15672 | Queue monitoring (guest / guest) |

### 8. Teardown

```bash
docker stop mysql-db rabbitmq inventory cart discount payment
docker rm mysql-db rabbitmq inventory cart discount payment
docker network rm ecommerce-net
```

---

## Backend API Reference

### Inventory Service — `http://localhost:5001`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/inventory` | List all products |
| `GET` | `/inventory/<id>` | Get a single product by ID |

### Cart Service — `http://localhost:5002`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/cart` | Add an item to the cart |
| `GET` | `/cart` | View all cart items |

```http
POST http://localhost:5002/cart
Content-Type: application/json

{ "product_id": 1, "quantity": 2 }
```

### Discount Service — `http://localhost:5003`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/discount` | Validate a coupon and return discounted price |

```http
POST http://localhost:5003/discount
Content-Type: application/json

{ "code": "NEWYEAR", "original_price": 100000 }
```

### Payment Service — `http://localhost:5004`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/payment` | Process payment, update inventory, publish RabbitMQ event |

```http
POST http://localhost:5004/payment
Content-Type: application/json

{ "product_id": 1, "quantity": 2, "discount_code": "NEWYEAR" }
```

---

## Frontend Pages

| Page | Route | Description |
|---|---|---|
| Products | `/` | Browse all products with Add to Cart and Buy Now actions |
| Cart | `/cart` | Review selected items, apply discount coupon, proceed to checkout |
| Checkout | `/checkout` | Enter delivery details and place order |
| Order Confirmed | `/order-confirmed` | Order success view with order ID and delivery summary |

---

## Database Tables

| Table | Purpose |
|---|---|
| `inventory` | Product name, price, and available quantity |
| `cart` | Items added to cart per session |
| `payments` | All completed transaction records |

---

## Author

**Athuldas**

- MCA Candidate — LEAD College, Palakkad (2026)
- GitHub: [@createwithathuldas](https://github.com/createwithathuldas)
- Repository: [smart-ecommerce](https://github.com/createwithathuldas/smart-ecommerce)

---

*Cloud Computing — MCA Assignment | March 2026*