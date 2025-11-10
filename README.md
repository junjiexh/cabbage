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

- Node.js 18+ and npm
- Java 17+
- Maven 3.6+
- MySQL 8.0+
- Google Gemini API key

## Setup Instructions

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

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Verify database credentials in `application.properties`
- Check if database `cabbage` exists

### Gemini API Issues
- Verify your API key is correct
- Check API key has required permissions
- Ensure you have API quota available

### CORS Issues
- Check frontend URL is allowed in `CorsConfig.java`
- Verify backend is running on port 8080

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
