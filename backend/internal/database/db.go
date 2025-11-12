package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

type DB struct {
	*sql.DB
}

func New(connStr string) (*DB, error) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("Successfully connected to database")

	return &DB{db}, nil
}

func (db *DB) InitSchema() error {
	query := `
	CREATE TABLE IF NOT EXISTS todos (
		id SERIAL PRIMARY KEY,
		title VARCHAR(255) NOT NULL,
		description TEXT,
		duration INTEGER NOT NULL,
		priority INTEGER DEFAULT 1,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS timelines (
		id SERIAL PRIMARY KEY,
		todo_ids INTEGER[] NOT NULL,
		timeline_data JSONB NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	`

	_, err := db.Exec(query)
	if err != nil {
		return fmt.Errorf("failed to initialize schema: %w", err)
	}

	log.Println("Database schema initialized successfully")
	return nil
}
