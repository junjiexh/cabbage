package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/cabbage/backend/internal/models"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type AIPlanner struct {
	client *genai.Client
	model  *genai.GenerativeModel
	useAI  bool
}

func NewAIPlanner() (*AIPlanner, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")

	if apiKey == "" {
		log.Println("Warning: GEMINI_API_KEY not set, using simple algorithm for timeline generation")
		return &AIPlanner{useAI: false}, nil
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		log.Printf("Warning: Failed to create AI client: %v. Using simple algorithm", err)
		return &AIPlanner{useAI: false}, nil
	}

	model := client.GenerativeModel("gemini-pro")
	model.SetTemperature(0.7)

	return &AIPlanner{
		client: client,
		model:  model,
		useAI:  true,
	}, nil
}

func (p *AIPlanner) GenerateTimeline(todos []models.Todo, startTime string) ([]models.TimelineItem, error) {
	if !p.useAI {
		return p.generateSimpleTimeline(todos, startTime)
	}

	return p.generateAITimeline(todos, startTime)
}

func (p *AIPlanner) generateSimpleTimeline(todos []models.Todo, startTime string) ([]models.TimelineItem, error) {
	timeline := make([]models.TimelineItem, 0, len(todos))

	// Parse start time
	parts := strings.Split(startTime, ":")
	if len(parts) != 2 {
		return nil, fmt.Errorf("invalid start time format")
	}

	hour, _ := strconv.Atoi(parts[0])
	minute, _ := strconv.Atoi(parts[1])

	currentTime := time.Date(2024, 1, 1, hour, minute, 0, 0, time.UTC)

	// Sort todos by priority (highest first)
	sortedTodos := make([]models.Todo, len(todos))
	copy(sortedTodos, todos)

	// Simple bubble sort by priority
	for i := 0; i < len(sortedTodos)-1; i++ {
		for j := 0; j < len(sortedTodos)-i-1; j++ {
			if sortedTodos[j].Priority < sortedTodos[j+1].Priority {
				sortedTodos[j], sortedTodos[j+1] = sortedTodos[j+1], sortedTodos[j]
			}
		}
	}

	// Generate timeline
	for _, todo := range sortedTodos {
		item := models.TimelineItem{
			TodoID:      todo.ID,
			Title:       todo.Title,
			Description: todo.Description,
			StartTime:   fmt.Sprintf("%02d:%02d", currentTime.Hour(), currentTime.Minute()),
			Duration:    todo.Duration,
		}

		endTime := currentTime.Add(time.Duration(todo.Duration) * time.Minute)
		item.EndTime = fmt.Sprintf("%02d:%02d", endTime.Hour(), endTime.Minute())

		timeline = append(timeline, item)
		currentTime = endTime
	}

	return timeline, nil
}

func (p *AIPlanner) generateAITimeline(todos []models.Todo, startTime string) ([]models.TimelineItem, error) {
	ctx := context.Background()

	// Build prompt
	todosJSON, _ := json.MarshalIndent(todos, "", "  ")
	prompt := fmt.Sprintf(`You are a smart day planner. Given a list of todos, create an optimized timeline for the day.

Todos:
%s

Starting time: %s

Please analyze the todos based on:
1. Priority (higher priority should come first when possible)
2. Duration (consider grouping similar duration tasks)
3. Natural work flow (consider dependencies and energy levels)

Return ONLY a JSON array of timeline items with this exact format:
[
  {
    "todo_id": 1,
    "title": "Task title",
    "description": "Task description",
    "start_time": "09:00",
    "end_time": "10:00",
    "duration": 60
  }
]

Do not include any markdown formatting or additional text. Return only the JSON array.`, todosJSON, startTime)

	resp, err := p.model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		log.Printf("AI generation failed, falling back to simple algorithm: %v", err)
		return p.generateSimpleTimeline(todos, startTime)
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return p.generateSimpleTimeline(todos, startTime)
	}

	responseText := fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])

	// Clean up response (remove markdown if present)
	responseText = strings.TrimPrefix(responseText, "```json")
	responseText = strings.TrimPrefix(responseText, "```")
	responseText = strings.TrimSuffix(responseText, "```")
	responseText = strings.TrimSpace(responseText)

	var timeline []models.TimelineItem
	if err := json.Unmarshal([]byte(responseText), &timeline); err != nil {
		log.Printf("Failed to parse AI response, falling back to simple algorithm: %v", err)
		return p.generateSimpleTimeline(todos, startTime)
	}

	return timeline, nil
}

// GenerateTodosFromGoal generates a list of todos based on a user's goal
func (p *AIPlanner) GenerateTodosFromGoal(goal string) ([]models.Todo, error) {
	if !p.useAI {
		return p.generateSimpleTodos(goal), nil
	}

	return p.generateAITodos(goal)
}

func (p *AIPlanner) generateSimpleTodos(goal string) []models.Todo {
	// Simple fallback: create a few generic todos
	return []models.Todo{
		{
			Title:       fmt.Sprintf("研究和规划: %s", goal),
			Description: "深入研究目标并制定详细计划",
			Duration:    60,
			Priority:    5,
		},
		{
			Title:       fmt.Sprintf("开始学习: %s", goal),
			Description: "开始学习相关知识和技能",
			Duration:    90,
			Priority:    4,
		},
		{
			Title:       fmt.Sprintf("实践练习: %s", goal),
			Description: "通过练习巩固所学内容",
			Duration:    120,
			Priority:    3,
		},
		{
			Title:       "总结和复习",
			Description: "回顾今天的学习成果",
			Duration:    30,
			Priority:    2,
		},
	}
}

func (p *AIPlanner) generateAITodos(goal string) ([]models.Todo, error) {
	ctx := context.Background()

	prompt := fmt.Sprintf(`你是一个智能任务规划助手。用户的目标是: "%s"

请为这个目标生成一个合理的待办事项列表。这些任务应该:
1. 具体可执行
2. 按照优先级排序 (1-5，5最高)
3. 有合理的时间估计（分钟）
4. 涵盖达成目标的关键步骤

返回一个JSON数组，格式如下（不要包含markdown格式或其他文本）:
[
  {
    "title": "任务标题",
    "description": "任务详细描述",
    "duration": 60,
    "priority": 5
  }
]

请生成5-8个任务，确保它们能帮助用户有效地朝目标前进。`, goal)

	resp, err := p.model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		log.Printf("AI generation failed, falling back to simple todos: %v", err)
		return p.generateSimpleTodos(goal), nil
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return p.generateSimpleTodos(goal), nil
	}

	responseText := fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])

	// Clean up response
	responseText = strings.TrimPrefix(responseText, "```json")
	responseText = strings.TrimPrefix(responseText, "```")
	responseText = strings.TrimSuffix(responseText, "```")
	responseText = strings.TrimSpace(responseText)

	var todos []models.Todo
	if err := json.Unmarshal([]byte(responseText), &todos); err != nil {
		log.Printf("Failed to parse AI response, falling back to simple todos: %v. Response: %s", err, responseText)
		return p.generateSimpleTodos(goal), nil
	}

	return todos, nil
}

func (p *AIPlanner) Close() {
	if p.client != nil {
		p.client.Close()
	}
}
