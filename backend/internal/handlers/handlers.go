package handlers

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/cabbage/backend/internal/database"
	"github.com/cabbage/backend/internal/models"
	"github.com/go-chi/chi/v5"
)

type Handler struct {
	DB        *database.DB
	AIPlanner *AIPlanner
}

func New(db *database.DB, aiPlanner *AIPlanner) *Handler {
	return &Handler{
		DB:        db,
		AIPlanner: aiPlanner,
	}
}

type contextKey string

const userContextKey contextKey = "user"

// generateSessionToken creates a random session token
func generateSessionToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

// AuthMiddleware extracts user from session token
func (h *Handler) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sessionToken := r.Header.Get("X-Session-Token")

		if sessionToken == "" {
			// Try cookie
			cookie, err := r.Cookie("session_token")
			if err == nil {
				sessionToken = cookie.Value
			}
		}

		if sessionToken != "" {
			var user models.User
			err := h.DB.QueryRow(`
				SELECT id, username, onboarding_completed, initial_goal, created_at, updated_at
				FROM users WHERE session_token = $1
			`, sessionToken).Scan(&user.ID, &user.Username, &user.OnboardingCompleted, &user.InitialGoal, &user.CreatedAt, &user.UpdatedAt)

			if err == nil {
				user.SessionToken = sessionToken
				ctx := context.WithValue(r.Context(), userContextKey, &user)
				next.ServeHTTP(w, r.WithContext(ctx))
				return
			}
		}

		// No valid session, continue without user
		next.ServeHTTP(w, r)
	})
}

// GetCurrentUser retrieves current user from context
func GetCurrentUser(r *http.Request) *models.User {
	user, ok := r.Context().Value(userContextKey).(*models.User)
	if !ok {
		return nil
	}
	return user
}

// RequireAuth middleware ensures user is authenticated
func (h *Handler) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user := GetCurrentUser(r)
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// GetOrCreateUser gets existing user or creates a new one
func (h *Handler) GetOrCreateUser(w http.ResponseWriter, r *http.Request) {
	user := GetCurrentUser(r)

	if user != nil {
		// User already exists
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user)
		return
	}

	// Create anonymous user
	sessionToken, err := generateSessionToken()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var newUser models.User
	err = h.DB.QueryRow(`
		INSERT INTO users (username, session_token, onboarding_completed)
		VALUES ($1, $2, $3)
		RETURNING id, username, session_token, onboarding_completed, created_at, updated_at
	`, "user_"+sessionToken[:8], sessionToken, false).Scan(
		&newUser.ID, &newUser.Username, &newUser.SessionToken,
		&newUser.OnboardingCompleted, &newUser.CreatedAt, &newUser.UpdatedAt,
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Set cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    sessionToken,
		Path:     "/",
		MaxAge:   86400 * 30, // 30 days
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newUser)
}

// CompleteOnboarding handles the onboarding flow
func (h *Handler) CompleteOnboarding(w http.ResponseWriter, r *http.Request) {
	user := GetCurrentUser(r)
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req models.OnboardingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if req.Goal == "" {
		http.Error(w, "Goal is required", http.StatusBadRequest)
		return
	}

	// Generate todos from goal using AI
	todos, err := h.AIPlanner.GenerateTodosFromGoal(req.Goal)
	if err != nil {
		log.Printf("Error generating todos: %v", err)
		http.Error(w, "Failed to generate todos", http.StatusInternalServerError)
		return
	}

	// Update user's username if provided
	username := user.Username
	if req.Username != "" {
		username = req.Username
	}

	// Update user as onboarded
	_, err = h.DB.Exec(`
		UPDATE users
		SET onboarding_completed = true, initial_goal = $1, username = $2, updated_at = CURRENT_TIMESTAMP
		WHERE id = $3
	`, req.Goal, username, user.ID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Save todos to database
	savedTodos := make([]models.Todo, 0, len(todos))
	for _, todo := range todos {
		var savedTodo models.Todo
		err := h.DB.QueryRow(`
			INSERT INTO todos (user_id, title, description, duration, priority)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id, user_id, title, description, duration, priority, created_at, updated_at
		`, user.ID, todo.Title, todo.Description, todo.Duration, todo.Priority).Scan(
			&savedTodo.ID, &savedTodo.UserID, &savedTodo.Title, &savedTodo.Description,
			&savedTodo.Duration, &savedTodo.Priority, &savedTodo.CreatedAt, &savedTodo.UpdatedAt,
		)

		if err != nil {
			log.Printf("Error saving todo: %v", err)
			continue
		}
		savedTodos = append(savedTodos, savedTodo)
	}

	// Get updated user
	var updatedUser models.User
	err = h.DB.QueryRow(`
		SELECT id, username, session_token, onboarding_completed, initial_goal, created_at, updated_at
		FROM users WHERE id = $1
	`, user.ID).Scan(&updatedUser.ID, &updatedUser.Username, &updatedUser.SessionToken,
		&updatedUser.OnboardingCompleted, &updatedUser.InitialGoal, &updatedUser.CreatedAt, &updatedUser.UpdatedAt)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := models.OnboardingResponse{
		User:  updatedUser,
		Todos: savedTodos,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetTodos retrieves all todos for the current user
func (h *Handler) GetTodos(w http.ResponseWriter, r *http.Request) {
	user := GetCurrentUser(r)
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	rows, err := h.DB.Query(`
		SELECT id, user_id, title, description, duration, priority, created_at, updated_at
		FROM todos
		WHERE user_id = $1
		ORDER BY created_at DESC
	`, user.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var todos []models.Todo
	for rows.Next() {
		var todo models.Todo
		err := rows.Scan(&todo.ID, &todo.UserID, &todo.Title, &todo.Description, &todo.Duration, &todo.Priority, &todo.CreatedAt, &todo.UpdatedAt)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		todos = append(todos, todo)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(todos)
}

// CreateTodo creates a new todo for the current user
func (h *Handler) CreateTodo(w http.ResponseWriter, r *http.Request) {
	user := GetCurrentUser(r)
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var todo models.Todo
	if err := json.NewDecoder(r.Body).Decode(&todo); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err := h.DB.QueryRow(`
		INSERT INTO todos (user_id, title, description, duration, priority)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, user_id, created_at, updated_at
	`, user.ID, todo.Title, todo.Description, todo.Duration, todo.Priority).Scan(&todo.ID, &todo.UserID, &todo.CreatedAt, &todo.UpdatedAt)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(todo)
}

// UpdateTodo updates an existing todo (user-specific)
func (h *Handler) UpdateTodo(w http.ResponseWriter, r *http.Request) {
	user := GetCurrentUser(r)
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

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
		WHERE id = $5 AND user_id = $6
	`, todo.Title, todo.Description, todo.Duration, todo.Priority, todoID, user.ID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	todo.ID = todoID
	todo.UserID = user.ID
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(todo)
}

// DeleteTodo deletes a todo (user-specific)
func (h *Handler) DeleteTodo(w http.ResponseWriter, r *http.Request) {
	user := GetCurrentUser(r)
	if user == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id := chi.URLParam(r, "id")
	todoID, err := strconv.Atoi(id)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	_, err = h.DB.Exec("DELETE FROM todos WHERE id = $1 AND user_id = $2", todoID, user.ID)
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
