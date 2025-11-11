package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/cabbage/backend/internal/database"
	"github.com/cabbage/backend/internal/models"
	"github.com/go-chi/chi/v5"
)

type Handler struct {
	DB      *database.DB
	AIPlanner *AIPlanner
}

func New(db *database.DB, aiPlanner *AIPlanner) *Handler {
	return &Handler{
		DB:      db,
		AIPlanner: aiPlanner,
	}
}

// GetTodos retrieves all todos
func (h *Handler) GetTodos(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(`
		SELECT id, title, description, duration, priority, created_at, updated_at
		FROM todos
		ORDER BY created_at DESC
	`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var todos []models.Todo
	for rows.Next() {
		var todo models.Todo
		err := rows.Scan(&todo.ID, &todo.Title, &todo.Description, &todo.Duration, &todo.Priority, &todo.CreatedAt, &todo.UpdatedAt)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		todos = append(todos, todo)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(todos)
}

// CreateTodo creates a new todo
func (h *Handler) CreateTodo(w http.ResponseWriter, r *http.Request) {
	var todo models.Todo
	if err := json.NewDecoder(r.Body).Decode(&todo); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err := h.DB.QueryRow(`
		INSERT INTO todos (title, description, duration, priority)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at
	`, todo.Title, todo.Description, todo.Duration, todo.Priority).Scan(&todo.ID, &todo.CreatedAt, &todo.UpdatedAt)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(todo)
}

// UpdateTodo updates an existing todo
func (h *Handler) UpdateTodo(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	todoID, err := strconv.Atoi(id)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var todo models.Todo
	if err := json.NewDecoder(r.Body).Decode(&todo); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	_, err = h.DB.Exec(`
		UPDATE todos
		SET title = $1, description = $2, duration = $3, priority = $4, updated_at = CURRENT_TIMESTAMP
		WHERE id = $5
	`, todo.Title, todo.Description, todo.Duration, todo.Priority, todoID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	todo.ID = todoID
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(todo)
}

// DeleteTodo deletes a todo
func (h *Handler) DeleteTodo(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	todoID, err := strconv.Atoi(id)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	_, err = h.DB.Exec("DELETE FROM todos WHERE id = $1", todoID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// PlanDay generates a timeline from todos using AI
func (h *Handler) PlanDay(w http.ResponseWriter, r *http.Request) {
	var req models.PlanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if req.StartTime == "" {
		req.StartTime = "09:00"
	}

	timeline, err := h.AIPlanner.GenerateTimeline(req.Todos, req.StartTime)
	if err != nil {
		log.Printf("Error generating timeline: %v", err)
		http.Error(w, "Failed to generate timeline", http.StatusInternalServerError)
		return
	}

	response := models.PlanResponse{
		Timeline: timeline,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Health check endpoint
func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}
