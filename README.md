# Cabbage - AI Daily Planner

Cabbage is an intelligent daily planner that uses AI to help you organize your day. It combines task management with AI-powered scheduling to create personalized daily plans based on your goals, preferences, and priorities.

## Features

- **User Settings & Goals**: Configure your daily schedule, work hours, and long-term goals
- **TODO List Management**: Create, edit, and manage tasks with priorities and due dates
- **AI-Powered Planning**: Generate personalized daily schedules using Google's Gemini AI
- **Progress Tracking**: Visualize your productivity with statistics and completion rates
- **Modern UI**: Beautiful interface with Claude-inspired theme using Tailwind CSS

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui components
- React Router for navigation
- Axios for API calls

### Backend
- Spring Boot 3.2
- Java 17
- Spring Data JPA
- MySQL database
- Google Gemini AI integration

## Prerequisites

### Option 1: Docker (Recommended)
- Docker and Docker Compose
- Google Gemini API key

### Option 2: Local Development
- Node.js 18+ and npm
- Java 17+
- Maven 3.6+
- MySQL 8.0+
- Google Gemini API key

## Quick Start with Docker (Recommended)

The easiest way to run Cabbage is using Docker Compose, which will set up all services (MySQL, Backend, Frontend) automatically.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cabbage
```

### 2. Configure Environment

```bash
# Copy and edit the environment file
cp .env.example .env

# Edit .env and add your Gemini API key
# Get your API key from: https://makersuite.google.com/app/apikey
nano .env
```

### 3. Start All Services

**Easy Way (Using startup script):**
```bash
# Make scripts executable (first time only)
chmod +x start.sh stop.sh

# Start all services
./start.sh
```

**Manual Way:**
```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

### 4. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080/api
- **MySQL**: localhost:3306

### 5. Stop Services

**Easy Way (Using stop script):**
```bash
./stop.sh
```

**Manual Way:**
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (deletes database data)
docker-compose down -v
```

## Local Development Setup

If you prefer to run the services locally without Docker:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cabbage
```

### 2. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE cabbage;
```

### 3. Backend Setup

```bash
cd backend

# Copy environment variables
cp .env.example .env

# Edit .env and add your configuration:
# - Database credentials
# - Gemini API key (get from https://makersuite.google.com/app/apikey)

# Build and run
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## Configuration

### Backend Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/cabbage
spring.datasource.username=your-username
spring.datasource.password=your-password

# Gemini API
gemini.api.key=your-gemini-api-key
```

### Frontend Configuration

Edit `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

## Usage

1. **Configure Settings**: Start by setting your wake/sleep times, work hours, and goals in the Settings page
2. **Add Tasks**: Create tasks in the TODO List with priorities and due dates
3. **Generate Plan**: Click "Plan My Day" on the Planner page to generate an AI-powered schedule
4. **Track Progress**: View your completion rates and statistics on the Progress page

## API Endpoints

### User Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

### TODO Management
- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create new todo
- `PUT /api/todos/{id}` - Update todo
- `DELETE /api/todos/{id}` - Delete todo
- `PATCH /api/todos/{id}/toggle` - Toggle completion status

### AI Planner
- `POST /api/planner/generate` - Generate daily plan
- `GET /api/planner/today` - Get today's plan
- `PATCH /api/planner/{planId}/items/{itemId}` - Update schedule item

### Progress
- `GET /api/progress/stats` - Get progress statistics

## Project Structure

```
cabbage/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   ├── UserSettings.tsx
│   │   │   ├── TodoList.tsx
│   │   │   ├── AIPlanner.tsx
│   │   │   └── ProgressTracker.tsx
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript types
│   │   ├── lib/            # Utility functions
│   │   └── App.tsx         # Main app component
│   └── package.json
├── backend/                 # Spring Boot backend
│   ├── src/
│   │   └── main/
│   │       └── java/com/cabbage/app/
│   │           ├── model/      # JPA entities
│   │           ├── repository/ # Data repositories
│   │           ├── service/    # Business logic
│   │           ├── controller/ # REST controllers
│   │           └── config/     # Configuration
│   └── pom.xml
└── plan.md                  # Original project plan
```

## Development

### Frontend Development

```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development

```bash
cd backend
mvn spring-boot:run  # Run application
mvn test            # Run tests
mvn clean install   # Build JAR
```

## Docker Commands

### View Service Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql

# Follow logs in real-time
docker-compose logs -f backend
```

### Rebuild Services

```bash
# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Rebuild and restart
docker-compose up -d --build backend
```

### Access Service Containers

```bash
# Access backend container
docker exec -it cabbage-backend sh

# Access MySQL container
docker exec -it cabbage-mysql mysql -uroot -ppassword cabbage
```

### Clean Up

```bash
# Remove all containers and networks
docker-compose down

# Remove containers, networks, and volumes
docker-compose down -v

# Remove all unused Docker data
docker system prune -a
```

## Troubleshooting

### Docker Issues

**Port already in use:**
```bash
# Check what's using the port
lsof -i :80    # Frontend
lsof -i :8080  # Backend
lsof -i :3306  # MySQL

# Stop the service or change port in docker-compose.yml
```

**Services not starting:**
```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs backend

# Restart services
docker-compose restart backend
```

**Database initialization issues:**
```bash
# Remove MySQL volume and restart
docker-compose down -v
docker-compose up -d mysql

# Wait for MySQL to be ready, then start other services
docker-compose up -d backend frontend
```

**Build cache issues:**
```bash
# Clear build cache and rebuild
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Issues
- Ensure MySQL is running: `docker-compose ps`
- Verify database credentials in `docker-compose.yml`
- Check MySQL logs: `docker-compose logs mysql`
- Wait for MySQL healthcheck to pass before backend starts

### Gemini API Issues
- Verify your API key is correct in `.env` file
- Check API key has required permissions
- Ensure you have API quota available
- Check backend logs: `docker-compose logs backend`

### CORS Issues
- Check frontend is accessing backend via `localhost:8080`
- Verify backend CORS configuration in `CorsConfig.java`
- Check browser console for CORS errors

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
