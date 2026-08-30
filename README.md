# SkyRoute Platform

A real-time, event-driven drone delivery and pharmacy fleet orchestration platform built with TypeScript, Express, Socket.io, Prisma, and Docker Compose.

SkyRoute coordinates autonomous drone deliveries across independent pharmacy branches. It features multi-tenant data isolation, dependency-injected services, real-time GPS telemetry via WebSockets, and a containerized drone simulation fleet that replicates autonomous flight paths.

---

## System Architecture

The project is structured as an npm monorepo using a **Vertical Slice Architecture** to cleanly isolate features across the stack:

* **`apps/server`**: Express and TypeScript REST API upgraded with Socket.io for bidirectional communication. Implements role-based access control (RBAC), multi-tenant pharmacy scoping, and dependency-injected Prisma services.
* **`apps/client`**: React and Vite single-page application for pharmacists, technicians, and administrators. Provides live fleet tracking, order assignment, and pharmacy management.
* **`apps/drone-sim`**: Standalone Node.js worker acting as a virtual IoT drone client. Consumes flight assignments over Socket.io, simulates waypoint-based GPS telemetry, and reports delivery status changes.
* **`packages/shared`**: Shared TypeScript data models, DTOs, and status enums used across services.

---

## Tech Stack

* **Runtime & Language:** Node.js (v20+), TypeScript
* **Backend Framework:** Express.js, Socket.io
* **Database & ORM:** PostgreSQL, Prisma ORM
* **Frontend:** React, Vite
* **Testing:** Jest (Backend), Cypress (End-to-End)
* **DevOps & Tooling:** Docker, Docker Compose, npm Workspaces

---

## Core Features

* **Multi-Tenant Branch Isolation:** Restricts data visibility so pharmacy personnel only view and manage orders and drones belonging to their assigned pharmacy branch.
* **Real-Time Fleet Telemetry:** Streams live drone coordinates via Socket.io rooms, persisting locations to PostgreSQL and broadcasting updates to the client dashboard.
* **Order Orchestration:** Enforces validation checks before assigning orders to idle drones, automatically updating delivery and drone lifecycles.
* **Simulated Hardware Workers:** Dedicated simulation containers model autonomous hardware behavior by reporting telemetry at fixed intervals.
* **Role-Based Security:** JWT authentication protecting API routes and socket handshakes with role verification (Admin, Pharmacist, Technician).

---

## Prerequisites

* Docker & Docker Compose (v2.0+)
* Node.js (v20+)
* npm (v10+)

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/skyroute-platform.git
cd skyroute-platform
```

### 2. Configure Environment Variables
Create an `.env` file at the root of the project by copying the provided example file:

```bash
cp .env.example .env
```

The default values in `.env` are sufficient for local development. These variables configure database credentials, JWT secrets, and service account passwords across the platform.

*(Note: `docker-compose.yml` automatically injects these variables into the required services like the server, database, and drone simulators).*

### 3. Launch the Application
Build and start all services using Docker Compose:

```bash
docker compose up --build
```

This starts:
* **Backend API & WebSockets:** `http://localhost:8080`
* **Frontend Dashboard:** `http://localhost:5173`
* **PostgreSQL Database:** `localhost:5432`
* **Adminer (Database GUI):** `http://localhost:8081`
* **Drone Simulators:** Connected via internal Docker networking

To shut down all containers:
```bash
docker compose down
```

---

## Database Management

Database migrations run automatically on container startup. If you want to interact with Prisma directly from your host machine, install the Prisma CLI:

```bash
npm install -g prisma
```

Common database tasks:
```bash
# Generate Prisma Client after modifying schema.prisma
npx prisma generate

# Apply new migrations locally
npx prisma migrate dev --name <migration-name>

# Reset database to a clean state with seed data
npx prisma migrate reset
```

---

## Running Tests

### Backend Unit & Integration Tests
Run the backend test suite:

```bash
cd apps/server
npx prisma generate
npm test
```

### End-to-End Tests
Ensure your server is running (`docker compose up`), then launch Cypress from the client workspace:

```bash
cd apps/client
npm install
npx cypress open
```

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.
