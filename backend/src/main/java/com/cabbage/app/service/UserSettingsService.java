package com.cabbage.app.service;

import com.cabbage.app.model.UserSettings;
import com.cabbage.app.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class UserSettingsService {
    private final UserSettingsRepository repository;

    public UserSettings getSettings() {
        return repository.findAll().stream()
                .findFirst()
                .orElseGet(this::createDefaultSettings);
    }

    @Transactional
    public UserSettings updateSettings(UserSettings settings) {
        UserSettings existing = getSettings();
        settings.setId(existing.getId());
        return repository.save(settings);
    }

    private UserSettings createDefaultSettings() {
        UserSettings settings = new UserSettings();
        settings.setWakeUpTime("07:00");
        settings.setSleepTime("23:00");
        settings.setWorkStartTime("09:00");
        settings.setWorkEndTime("17:00");
        settings.setGoals(new ArrayList<>());
        settings.setTodayFocus("");
        return repository.save(settings);
    }
}
