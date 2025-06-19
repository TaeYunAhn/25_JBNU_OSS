package com.jbnu.calelog.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-19
 * @description 반복 일정의 규칙을 저장하는 엔티티
 *             iCalendar RFC 5545 표준 RRULE 형식을 지원
 */
@Entity
@Table(name = "schedule_rules")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ScheduleRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private Schedule.ScheduleType type;

    @Column(name = "content", length = 40)
    private String content;

    @Column(name = "start_time_base", nullable = false)
    private LocalTime startTimeBase;

    @Column(name = "end_time_base", nullable = false)
    private LocalTime endTimeBase;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "rrule", nullable = false, length = 255)
    private String rrule;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "rule", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ScheduleException> exceptions = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

}