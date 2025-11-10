#!/bin/bash

# Cabbage AI Daily Planner - Stop Script

echo "🥬 Stopping Cabbage AI Daily Planner..."
echo ""

docker-compose down

echo ""
echo "✅ All services stopped!"
echo ""
echo "To remove all data including database:"
echo "   docker-compose down -v"
echo ""
