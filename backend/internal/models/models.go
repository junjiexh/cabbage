package models

import "time"

type User struct {
	ID                   int       `json:"id"`
	Username             string    `json:"username"`
	SessionToken         string    `json:"session_token,omitempty"`
	OnboardingCompleted  bool      `json:"onboarding_completed"`
	InitialGoal          string    `json:"initial_goal,omitempty"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
}

type Todo struct {
	ID          int       `json:"id"`
	UserID      int       `json:"user_id,omitempty"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Duration    int       `json:"duration"` // in minutes
	Priority    int       `json:"priority"` // 1-5, 5 being highest
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type TimelineItem struct {
	TodoID      int       `json:"todo_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	StartTime   string    `json:"start_time"` // HH:MM format
	EndTime     string    `json:"end_time"`   // HH:MM format
	Duration    int       `json:"duration"`
}

type Timeline struct {
	ID        int            `json:"id"`
	Items     []TimelineItem `json:"items"`
	CreatedAt time.Time      `json:"created_at"`
}

type PlanRequest struct {
	Todos     []Todo `json:"todos"`
	StartTime string `json:"start_time"` // HH:MM format, e.g., "09:00"
}

type PlanResponse struct {
	Timeline []TimelineItem `json:"timeline"`
}

type OnboardingRequest struct {
	Username string `json:"username"`
	Goal     string `json:"goal"`
}

type OnboardingResponse struct {
	User  User   `json:"user"`
	Todos []Todo `json:"todos"`
}
