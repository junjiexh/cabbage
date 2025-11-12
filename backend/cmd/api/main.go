package main

import (
	"log"
	"net/http"
	"os"

	"github.com/cabbage/backend/internal/database"
	"github.com/cabbage/backend/internal/handlers"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	// Get configuration from environment
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://cabbage:cabbage123@localhost:5432/cabbage?sslmode=disable"
	}

	// Connect to database
	db, err := database.New(dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize database schema
	if err := db.InitSchema(); err != nil {
		log.Fatalf("Failed to initialize schema: %v", err)
	}

	// Initialize AI planner
	aiPlanner, err := handlers.NewAIPlanner()
	if err != nil {
		log.Fatalf("Failed to initialize AI planner: %v", err)
	}
	defer aiPlanner.Close()

	// Create handler
	h := handlers.New(db, aiPlanner)

	// Setup router
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Session-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
	r.Use(h.AuthMiddleware) // Apply auth middleware globally

	// Routes
	r.Get("/health", h.Health)

	r.Route("/api", func(r chi.Router) {
		// User routes
		r.Get("/user", h.GetOrCreateUser)
		r.Post("/onboarding", h.CompleteOnboarding)

		// Todo routes (require auth)
		r.Get("/todos", h.GetTodos)
		r.Post("/todos", h.CreateTodo)
		r.Put("/todos/{id}", h.UpdateTodo)
		r.Delete("/todos/{id}", h.DeleteTodo)
		r.Post("/plan", h.PlanDay)
	})

	// Start server
	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
