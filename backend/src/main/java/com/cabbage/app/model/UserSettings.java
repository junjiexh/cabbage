package com.cabbage.app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String wakeUpTime;

    @Column(nullable = false)
    private String sleepTime;

    @Column(nullable = false)
    private String workStartTime;

    @Column(nullable = false)
    private String workEndTime;

    @ElementCollection
    @CollectionTable(name = "user_goals", joinColumns = @JoinColumn(name = "settings_id"))
    @Column(name = "goal")
    private List<String> goals = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String todayFocus;
}
