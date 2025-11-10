package com.cabbage.app.service;

import com.cabbage.app.model.*;
import com.cabbage.app.repository.DailyPlanRepository;
import com.cabbage.app.repository.ScheduleItemRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlannerService {
    private final DailyPlanRepository planRepository;
    private final ScheduleItemRepository scheduleItemRepository;
    private final UserSettingsService settingsService;
    private final TodoService todoService;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    @Transactional
    public DailyPlan generateDailyPlan() throws IOException {
        // Get user settings and incomplete todos
        UserSettings settings = settingsService.getSettings();
        List<TodoItem> todos = todoService.getIncompleteTodos();

        // Build prompt for Gemini
        String prompt = buildPrompt(settings, todos);

        // Get AI response
        String aiResponse = geminiService.generateContent(prompt);
        log.info("AI Response: {}", aiResponse);

        // Parse AI response and create schedule
        DailyPlan plan = parseAIResponse(aiResponse);

        // Save to database
        LocalDate today = LocalDate.now();
        Optional<DailyPlan> existingPlan = planRepository.findByDate(today);
        if (existingPlan.isPresent()) {
            // Delete existing plan and create new one
            planRepository.delete(existingPlan.get());
        }

        plan.setDate(today);
        return planRepository.save(plan);
    }

    public Optional<DailyPlan> getTodayPlan() {
        return planRepository.findByDate(LocalDate.now());
    }

    @Transactional
    public void updateScheduleItemStatus(Long planId, Long itemId, boolean completed) {
        ScheduleItem item = scheduleItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Schedule item not found"));
        item.setCompleted(completed);
        scheduleItemRepository.save(item);
    }

    private String buildPrompt(UserSettings settings, List<TodoItem> todos) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an AI daily planner. Create a detailed, realistic daily schedule based on the following information:\n\n");

        prompt.append("User's Schedule:\n");
        prompt.append("- Wake up time: ").append(settings.getWakeUpTime()).append("\n");
        prompt.append("- Sleep time: ").append(settings.getSleepTime()).append("\n");
        prompt.append("- Work hours: ").append(settings.getWorkStartTime())
              .append(" to ").append(settings.getWorkEndTime()).append("\n\n");

        if (!settings.getGoals().isEmpty()) {
            prompt.append("Long-term Goals:\n");
            for (String goal : settings.getGoals()) {
                prompt.append("- ").append(goal).append("\n");
            }
            prompt.append("\n");
        }

        if (settings.getTodayFocus() != null && !settings.getTodayFocus().isEmpty()) {
            prompt.append("Today's Main Focus:\n");
            prompt.append(settings.getTodayFocus()).append("\n\n");
        }

        if (!todos.isEmpty()) {
            prompt.append("Pending Tasks:\n");
            for (TodoItem todo : todos) {
                prompt.append("- [").append(todo.getPriority()).append("] ")
                      .append(todo.getTitle());
                if (todo.getDescription() != null && !todo.getDescription().isEmpty()) {
                    prompt.append(": ").append(todo.getDescription());
                }
                if (todo.getDueDate() != null) {
                    prompt.append(" (Due: ").append(todo.getDueDate()).append(")");
                }
                prompt.append("\n");
            }
            prompt.append("\n");
        }

        prompt.append("Create a realistic daily schedule in JSON format with the following structure:\n");
        prompt.append("{\n");
        prompt.append("  \"scheduleItems\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"startTime\": \"HH:MM\",\n");
        prompt.append("      \"endTime\": \"HH:MM\",\n");
        prompt.append("      \"title\": \"Activity title\",\n");
        prompt.append("      \"description\": \"Brief description\"\n");
        prompt.append("    }\n");
        prompt.append("  ]\n");
        prompt.append("}\n\n");
        prompt.append("Important guidelines:\n");
        prompt.append("- Include time for meals, breaks, exercise, and relaxation\n");
        prompt.append("- Prioritize high-priority tasks during peak productivity hours\n");
        prompt.append("- Be realistic about time estimates\n");
        prompt.append("- Include buffer time between activities\n");
        prompt.append("- Consider the user's goals and today's focus\n");
        prompt.append("- Return ONLY valid JSON, no additional text or markdown formatting\n");

        return prompt.toString();
    }

    private DailyPlan parseAIResponse(String response) {
        DailyPlan plan = new DailyPlan();

        try {
            // Remove markdown code blocks if present
            String cleanedResponse = response.trim();
            if (cleanedResponse.startsWith("```json")) {
                cleanedResponse = cleanedResponse.substring(7);
            } else if (cleanedResponse.startsWith("```")) {
                cleanedResponse = cleanedResponse.substring(3);
            }
            if (cleanedResponse.endsWith("```")) {
                cleanedResponse = cleanedResponse.substring(0, cleanedResponse.length() - 3);
            }
            cleanedResponse = cleanedResponse.trim();

            JsonNode root = objectMapper.readTree(cleanedResponse);
            JsonNode scheduleItems = root.path("scheduleItems");

            if (scheduleItems.isArray()) {
                for (JsonNode itemNode : scheduleItems) {
                    ScheduleItem item = new ScheduleItem();
                    item.setStartTime(itemNode.path("startTime").asText());
                    item.setEndTime(itemNode.path("endTime").asText());
                    item.setTitle(itemNode.path("title").asText());
                    item.setDescription(itemNode.path("description").asText());
                    item.setCompleted(false);
                    plan.addScheduleItem(item);
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse AI response: {}", e.getMessage());
            // Create a default schedule if parsing fails
            createDefaultSchedule(plan);
        }

        return plan;
    }

    private void createDefaultSchedule(DailyPlan plan) {
        UserSettings settings = settingsService.getSettings();

        ScheduleItem morning = new ScheduleItem();
        morning.setStartTime(settings.getWakeUpTime());
        morning.setEndTime("08:00");
        morning.setTitle("Morning Routine");
        morning.setDescription("Wake up, breakfast, and prepare for the day");
        morning.setCompleted(false);
        plan.addScheduleItem(morning);

        ScheduleItem work = new ScheduleItem();
        work.setStartTime(settings.getWorkStartTime());
        work.setEndTime(settings.getWorkEndTime());
        work.setTitle("Work/Focus Time");
        work.setDescription("Main productivity block");
        work.setCompleted(false);
        plan.addScheduleItem(work);

        ScheduleItem evening = new ScheduleItem();
        evening.setStartTime("18:00");
        evening.setEndTime(settings.getSleepTime());
        evening.setTitle("Evening Routine");
        evening.setDescription("Dinner, relaxation, and wind down");
        evening.setCompleted(false);
        plan.addScheduleItem(evening);
    }
}
