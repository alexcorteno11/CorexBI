# CorexBI

**A full-stack business intelligence application for sales analytics and inventory management.**

CorexBI is a portfolio project designed to demonstrate software engineering skills through a real-world business scenario. It combines a RESTful API, a relational database, an interactive dashboard, and automated testing to support product management, sales operations, and inventory monitoring.

## Features

### Interactive Dashboard

- Sales and revenue KPIs.
- Top-selling products ranked by performance.
- Revenue visualization by product.
- Revenue trends over time, with date filters.
- Low-stock inventory monitoring.

### Product Management

- Create and view products.
- Update product information.
- Search and filter the product catalog.
- Soft-delete products without deleting their historical sales records.

### Inventory Management

- Monitor product stock levels.
- Identify low-stock, critical-stock, and out-of-stock products.
- Search and filter inventory.
- Automatically update stock after completed sales.

### Sales Management

- Create sales containing multiple products.
- Validate quantities and available stock.
- Prevent duplicate products within a sale.
- Calculate totals using product prices.
- Store historical unit prices for accurate reporting.
- Register sales and update inventory within a database transaction.

## Technology Stack

| Layer              | Technologies                          |
| ------------------ | ------------------------------------- |
| Frontend           | React, TypeScript, Vite, Tailwind CSS |
| Data visualization | Recharts                              |
| Backend            | Python, FastAPI, Pydantic             |
| Database           | PostgreSQL                            |
| ORM                | SQLAlchemy                            |
| Migrations         | Alembic                               |
| Backend testing    | Pytest                                |
| Frontend testing   | Vitest, React Testing Library         |
| Version control    | Git, GitHub                           |

## Architecture

```text
React + TypeScript
       |
       | HTTP / JSON
       v
FastAPI REST API
       |
       v
SQLAlchemy ORM
       |
       v
PostgreSQL
```

The frontend communicates with the FastAPI backend through HTTP requests. The backend applies business rules, validates input, manages database transactions, and exposes analytics endpoints.

The application separates its API routes, database models, validation schemas, frontend pages, hooks, and service functions.

## Getting Started

The instructions below describe a local Windows development setup.

### Prerequisites

- Python 3.14
- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd CorexBI
```

Replace `YOUR_REPOSITORY_URL` with the actual GitHub repository URL.

### 2. Configure the Backend

Open PowerShell in the project directory:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

### 3. Configure PostgreSQL

Create a PostgreSQL database named:

```text
corexbi_db
```

Copy the environment template:

```powershell
Copy-Item .env.example .env
```

Edit `backend/.env` and set the connection string using your PostgreSQL credentials:

```dotenv
DATABASE_URL=postgresql+psycopg://YOUR_USER:YOUR_PASSWORD@localhost:5432/corexbi_db
```

Keep `.env` private. Do not commit database passwords or other credentials to version control.

### 4. Apply Database Migrations

With the backend virtual environment activated:

```powershell
python -m alembic upgrade head
```

This creates the database tables and applies the latest schema migrations.

### 5. Load Demo Data

The following commands are intended for a new database without existing sales:

```powershell
python seed.py
python seed_sales.py
```

These scripts create sample products and sales, including corresponding inventory updates.

The sales seed skips insertion when sales already exist to avoid adding duplicate demonstration transactions.

### 6. Start the Backend

```powershell
python -m uvicorn app.main:app --reload
```

The API will be available at:

- API: `http://127.0.0.1:8000`
- Interactive Swagger documentation: `http://127.0.0.1:8000/docs`

### 7. Start the Frontend

Open another PowerShell terminal from the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open:

`http://localhost:5173`

The Vite development server proxies API requests to the local FastAPI backend.

## API Endpoints

| Method | Endpoint                       | Description                      |
| ------ | ------------------------------ | -------------------------------- |
| GET    | `/health`                      | API health check                 |
| GET    | `/products`                    | List active products             |
| POST   | `/products`                    | Create a product                 |
| PATCH  | `/products/{id}`               | Update a product                 |
| DELETE | `/products/{id}`               | Soft-delete a product            |
| POST   | `/sales`                       | Register a sale                  |
| GET    | `/inventory/low-stock`         | Retrieve products with low stock |
| GET    | `/analytics/summary`           | Retrieve sales and revenue KPIs  |
| GET    | `/analytics/top-products`      | Retrieve top-selling products    |
| GET    | `/analytics/revenue-over-time` | Retrieve revenue trends by date  |

Refer to Swagger for request and response schemas.

## Automated Testing

CorexBI includes automated tests for backend operations and frontend behavior.

### Backend

From `backend` with the virtual environment activated:

```powershell
python -m pytest -q
```

**32 backend tests passing** in the validated development environment.

Coverage includes API behavior, input validation, sales operations, transaction rollback, inventory rules, and analytics.

Additional PostgreSQL concurrency scenarios were validated during development.

### Frontend

From `frontend`:

```powershell
npm run test
npm run build
```

**4 frontend tests passing** in the validated development environment.

The tests cover product searching, sales quantity validation, cancellation of product deactivation, and error handling.

## Screenshots

### Dashboard

![CorexBI Dashboard](docs/screenshots/dashboard.png)
![CorexBI Analytics](docs/screenshots/dashboard2.png)

### Product Management

![Product Management](docs/screenshots/products.png)

### Inventory Management

![Inventory Management](docs/screenshots/inventory.png)

### Sales Management

![Sales Management](docs/screenshots/sales.png)

## Technical Highlights

**Transactional sales processing**

Sales and inventory updates are executed as database transactions to prevent partially completed operations.

**Concurrency control**

PostgreSQL row-level locking is used in the sales workflow to protect inventory consistency when concurrent requests attempt to sell the same product.

**Historical price preservation**

Sale items store the unit price at the time of purchase, supporting accurate revenue reports even if product prices change later.

**Soft deletion**

Products can be deactivated while retaining their relationships with historical sales.

**Versioned database migrations**

Alembic manages database schema changes and supports initializing the schema from an empty PostgreSQL database.

**Automated testing**

Pytest and Vitest verify important backend and frontend behaviors.

## Project Purpose

CorexBI was developed as a software engineering portfolio project, with an emphasis on backend design, database integration, full-stack development, automated testing, and maintainable application architecture.

It is not intended to be a production-ready commercial platform.

## Future Improvements

Potential extensions include authentication and authorization, pagination, automated CI checks, containerized deployment, and additional reporting features.
