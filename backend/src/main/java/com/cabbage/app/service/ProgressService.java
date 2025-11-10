package com.cabbage.app.service;

import com.cabbage.app.dto.ProgressStats;
import com.cabbage.app.model.DailyPlan;
import com.cabbage.app.model.ScheduleItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProgressService {
    private final TodoService todoService;
    private final PlannerService plannerService;

    public ProgressStats getProgressStats() {
        long totalTodos = todoService.getTotalCount();
        long completedTodos = todoService.getCompletedCount();
        int completionRate = totalTodos > 0 ? (int) ((completedTodos * 100) / totalTodos) : 0;

        // Get today's schedule completion
        Optional<DailyPlan> todayPlan = plannerService.getTodayPlan();
        int scheduledItemsCompleted = 0;
        int totalScheduledItems = 0;

        if (todayPlan.isPresent()) {
            totalScheduledItems = todayPlan.get().getScheduleItems().size();
            scheduledItemsCompleted = (int) todayPlan.get().getScheduleItems().stream()
                    .filter(ScheduleItem::getCompleted)
                    .count();
        }

        return new ProgressStats(
                totalTodos,
                completedTodos,
                completionRate,
                scheduledItemsCompleted,
                totalScheduledItems
        );
    }
}
