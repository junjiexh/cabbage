package com.cabbage.app.controller;

import com.cabbage.app.dto.ProgressStats;
import com.cabbage.app.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProgressController {
    private final ProgressService service;

    @GetMapping("/stats")
    public ResponseEntity<ProgressStats> getStats() {
        return ResponseEntity.ok(service.getProgressStats());
    }
}
