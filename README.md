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
This starts a PostgreSQL container (`academia-postgres`) running on port `5432` with the database `academia_db`.

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
The frontend will be available at the local URL provided by Vite at http://localhost:5173 .

---

## 🛠️ Tech Stack

**Frontend:**
- **Framework:** React with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (featuring a custom teal/green design system)
- **State/Routing:** React Context & React Router

**Backend:**
- **Framework:** Spring Boot 3.3.5
- **Language:** Java 21
- **Security:** Spring Security
- **Data Access:** Spring Data JPA
- **Database Migrations:** Flyway
- **Real-time Communication:** WebSockets

**Infrastructure:**
- **Database:** PostgreSQL 16
- **Containerization:** Docker & Docker Compose
- **CI/CD:** GitHub Actions

---

## 📁 Project Structure

```text
academia/
├── backend/                # Java Spring Boot application
│   ├── src/main/java/      # Application logic (Controllers, Services, Models)
│   ├── src/main/resources/ # Configuration (application.properties, Flyway scripts)
│   ├── build.gradle        # Gradle dependencies & tasks
│   └── Dockerfile          # Run-time backend Docker image configuration
│
├── frontend/               # React + Vite frontend application
│   ├── src/                # UI components, pages, context, and API hooks
│   ├── package.json        # NPM dependencies and scripts
│   ├── tailwind.config.js  # Theme and styling configuration
│   └── Dockerfile          # Run-time frontend Docker image (Nginx)
│
├── .github/workflows/      # CI/CD pipelines (academia.yml)
└── docker-compose.yml      # Local infrastructure configuration (PostgreSQL)
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
* **Real-time WebSockets:** The application handles real-time features (like live study group chat or session tracking) over WebSockets routed through the Spring Boot backend. 
* **Docker Pipelines:** Both the `frontend` and `backend` directories contain a `Dockerfile`. These are intentionally designed as **run-time only** images. They expect the artifacts (`.jar` for backend, `dist/` for frontend) to be pre-built.
* **CI/CD Automation:** The GitHub Actions workflow automatically spins up a PostgreSQL service, runs backend tests, builds both projects, and generates the production-ready Docker images on every push to the `main` branch.

---

## 👨‍💻 Author
**Zaw Moe Htike**
