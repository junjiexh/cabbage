package com.cabbage.app.dto;

public record ProgressStats(
        long totalTodos,
        long completedTodos,
        int completionRate,
        int scheduledItemsCompleted,
        int totalScheduledItems
) {
}
