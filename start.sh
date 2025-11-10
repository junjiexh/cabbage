#!/bin/bash

# Cabbage AI Daily Planner - Startup Script

echo "🥬 Starting Cabbage AI Daily Planner..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and add your Gemini API key!"
    echo "Get your API key from: https://makersuite.google.com/app/apikey"
    echo ""
    echo "After adding your API key, run this script again."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install it and try again."
    exit 1
fi

echo "✅ Environment file found"
echo "✅ Docker is running"
echo ""

# Build and start services
echo "🔨 Building and starting services..."
echo "This may take a few minutes on first run..."
echo ""

docker-compose up -d --build

# Wait a moment for services to start
echo ""
echo "⏳ Waiting for services to start..."
sleep 5

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✨ Cabbage is starting up!"
echo ""
echo "📱 Access the application:"
echo "   Frontend:  http://localhost"
echo "   Backend:   http://localhost:8080/api"
echo "   MySQL:     localhost:3306"
echo ""
echo "📝 Useful commands:"
echo "   View logs:        docker-compose logs -f"
echo "   Stop services:    docker-compose down"
echo "   Restart:          docker-compose restart"
echo ""
echo "⏱️  Please wait 30-60 seconds for all services to fully initialize..."
echo "   You can check the logs with: docker-compose logs -f backend"
echo ""
