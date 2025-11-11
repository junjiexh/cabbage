# 🥬 Cabbage - AI Day Planner

Cabbage is a smart day planner that helps you organize your tasks and generates an optimized timeline using AI.

## Features

- 📝 Todo list management
- 🤖 AI-powered timeline generation (Gemini API)
- ⏰ Custom start time for your day
- 📊 Priority-based task scheduling
- 🐳 Docker deployment

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Go + Chi + PostgreSQL
- **AI**: Google Gemini API (with fallback algorithm)
- **DevOps**: Docker + Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose
- (Optional) Gemini API key for AI-powered planning

### Setup

1. Clone the repository:
```bash
git clone <repo-url>
cd cabbage
```

2. (Optional) Set up Gemini API key:
```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

3. Start the services:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 8080
- Frontend will need to be started separately (see below)

4. Start the frontend:
```bash
cd frontend
pnpm install
pnpm dev
```

5. Open http://localhost:5173 in your browser

## Usage

1. **Add todos**: Fill in the form with task title, description, duration (in minutes), and priority
2. **Manage todos**: View all your todos and delete any you don't need
3. **Set start time**: Choose when you want to start your day
4. **Plan your day**: Click "📅 Plan My Day" to generate an optimized timeline
5. **View timeline**: See your tasks scheduled throughout the day

## API Endpoints

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo
- `POST /api/plan` - Generate a timeline from todos

## Development

### Backend

```bash
cd backend
go mod download
go run cmd/api/main.go
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string (default: postgres://cabbage:cabbage123@localhost:5432/cabbage?sslmode=disable)
- `PORT`: Backend server port (default: 8080)
- `GEMINI_API_KEY`: Google Gemini API key (optional - uses simple algorithm if not provided)

## Notes

- If no Gemini API key is provided, the app will use a simple priority-based scheduling algorithm
- The AI planner considers task priority, duration, and natural workflow when generating timelines
- All times are in 24-hour format (HH:MM)

## License

MIT
