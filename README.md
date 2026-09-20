# Academia

Academia is a collaborative study platform designed to help students track their focus, join study groups, and ace their exams together. It features a modern, responsive user interface and a robust backend to handle user management, real-time study sessions, and progress tracking.

---

## 🚀 Getting Started (Local Setup)

### Prerequisites

 - [Java 21](https://adoptium.net/)
 - [Node.js 20+ and npm](https://nodejs.org/)
 - [Docker](https://www.docker.com/)
 - [Gradle](https://gradle.org/install/)

### 1. Start the Database (Docker)
The project uses PostgreSQL as its primary database. To spin up a local instance, use the provided Docker Compose file from the root directory:
```bash
docker compose up -d
```
This starts a PostgreSQL 17 container (`academia-postgres`) running on port `5432` with the database `academia_db`.

### 2. Run the Backend
The Spring Boot backend will automatically connect to the local PostgreSQL database and run Flyway schema migrations on startup.
```bash
cd backend
./gradlew bootRun
```
The backend REST API and WebSocket server will now be available at http://localhost:8080.

### 3. Run the Frontend
In a new terminal window, install the Node dependencies and start the Vite development server:
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at the local URL provided by Vite at http://localhost:5173.

### 4. Run Automated Tests
Academia includes end-to-end (E2E) and behavior-driven development (BDD) test suites powered by Playwright and Cucumber/playwright-bdd:
```bash
cd frontend

# Run Playwright E2E tests
npm run test:e2e

# Run BDD Gherkin feature tests
npm run test:bdd

# Run all frontend tests (E2E + BDD)
npm run test:all

# Launch Playwright interactive UI runner
npm run test:e2e:ui
```

To run the backend test suite:
```bash
cd backend
./gradlew test
```

---

## 🛠️ Tech Stack

**Frontend:**
- **Framework:** React 19 with Vite 8
- **Language:** TypeScript 6
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`) with custom theme & dark mode support
- **Icons:** Lucide React
- **State & Routing:** React Context & React Router v7
- **HTTP Client:** Axios
- **Real-time Client:** STOMP (`@stomp/stompjs`) & SockJS (`sockjs-client`)

**Testing & Quality Assurance:**
- **End-to-End Testing:** Playwright (`@playwright/test`)
- **BDD Testing:** Playwright-BDD (`playwright-bdd` / Cucumber Gherkin)
- **Backend Testing:** JUnit 5, Spring Boot Starter Test, Spring Security Test
- **Linting:** ESLint 10 with TypeScript-ESLint

**Backend:**
- **Framework:** Spring Boot 3.3.5
- **Language:** Java 21
- **Security & Tokens:** Spring Security, JSON Web Tokens (JJWT 0.12.6)
- **Data Access:** Spring Data JPA (Hibernate)
- **Database Migrations:** Flyway
- **Real-time Communication:** Spring WebSocket & STOMP messaging
- **Utilities:** Project Lombok, Spring Boot Actuator

**Infrastructure & DevOps:**
- **Database:** PostgreSQL 17
- **Containerization:** Docker & Docker Compose
- **CI/CD:** GitHub Actions (Multi-job workflow for build, test, and Docker image packaging)

---

## 📁 Project Structure

```text
academia/
├── backend/                  # Java Spring Boot application
│   ├── src/main/java/        # Application logic (Controllers, Services, Models)
│   ├── src/main/resources/   # Configuration (application.properties, Flyway scripts)
│   ├── build.gradle          # Gradle dependencies & tasks
│   └── Dockerfile            # Run-time backend Docker image configuration
│
├── frontend/                 # React + Vite frontend application
│   ├── src/                  # UI components, pages, context, and API hooks
│   ├── e2e/                  # Playwright E2E specs, BDD feature files & step definitions
│   ├── package.json          # NPM dependencies and scripts
│   ├── playwright.config.ts  # Playwright E2E configuration
│   ├── playwright.bdd.config.ts # Cucumber / BDD Playwright configuration
│   ├── vite.config.ts        # Vite configuration (with Tailwind CSS v4 plugin)
│   └── Dockerfile            # Run-time frontend Docker image (Nginx)
│
├── .github/workflows/        # CI/CD pipelines (academia.yml)
└── docker-compose.yml        # Local infrastructure configuration (PostgreSQL)
```

---

## 🐳 Dockerization

The project includes Dockerfiles for both the frontend and backend, structured for a run-time only configuration (designed to work alongside CI/CD pipelines that pre-build the artifacts).

- **Backend Dockerfile:** Expects a pre-built `.jar` file in `backend/build/libs/` and runs it using the lightweight `eclipse-temurin:21-jre` image.
- **Frontend Dockerfile:** Expects a pre-built static site in `frontend/dist/` and serves it using an `nginx:alpine` web server.

---

## 🔄 CI/CD Pipeline

Academia uses **GitHub Actions** for continuous integration. Upon every push or pull request to the `main` branch, the workflow (`.github/workflows/academia.yml`):
1. Sets up a temporary PostgreSQL service container.
2. Builds and tests the Java 21 Spring Boot backend.
3. Builds the Node 20 React frontend.
4. Uploads the build artifacts (`.jar` and `dist/`).
5. Builds the production-ready Docker images.

---

## 📝 Development Notes

* **Authentication (JWT):** The application uses stateless JSON Web Tokens (JWT) for secure authentication. The frontend passes the token as a Bearer token in the `Authorization` header for all protected API calls.
* **Database Migrations:** We use **Flyway** for database versioning. Schema changes are located in `backend/src/main/resources/db/migration/`. Never modify an existing migration file; always create a new one!
* **Real-time WebSockets:** The application handles real-time features (like live study group chat or session tracking) over WebSockets routed through the Spring Boot backend using STOMP and SockJS.
* **Automated Testing (Playwright & BDD):** The frontend has automated test coverage using Playwright for standard end-to-end tests and `playwright-bdd` for Gherkin/Cucumber behavior-driven development tests.
* **Docker Pipelines:** Both the `frontend` and `backend` directories contain a `Dockerfile`. These are intentionally designed as **run-time only** images. They expect the artifacts (`.jar` for backend, `dist/` for frontend) to be pre-built.
* **CI/CD Automation:** The GitHub Actions workflow automatically spins up a PostgreSQL service, runs backend tests, builds both projects, and generates the production-ready Docker images on every push to the `main` branch.

---

## 👨‍💻 Author
**Zaw Moe Htike**
