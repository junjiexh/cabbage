package com.cabbage.app.controller;

import com.cabbage.app.model.DailyPlan;
import com.cabbage.app.service.PlannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/planner")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PlannerController {
    private final PlannerService service;

    @PostMapping("/generate")
    public ResponseEntity<?> generatePlan() {
        try {
            DailyPlan plan = service.generateDailyPlan();
            return ResponseEntity.ok(plan);
        } catch (IOException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Failed to generate plan: " + e.getMessage()));
        }
    }

    @GetMapping("/today")
    public ResponseEntity<DailyPlan> getTodayPlan() {
        return service.getTodayPlan()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{planId}/items/{itemId}")
    public ResponseEntity<Void> updateScheduleItem(
            @PathVariable Long planId,
            @PathVariable Long itemId,
            @RequestBody Map<String, Boolean> body
    ) {
        boolean completed = body.getOrDefault("completed", false);
        service.updateScheduleItemStatus(planId, itemId, completed);
        return ResponseEntity.ok().build();
    }
}
