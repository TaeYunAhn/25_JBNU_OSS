package com.jbnu.calelog.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-19
 * @description 반복 일정에 대한 예외 처리를 저장하는 엔티티
 *             특정 날짜의 반복 일정을 수정하거나 취소할 때 사용
 */
@Entity
@Table(name = "schedule_exceptions",
       uniqueConstraints = @UniqueConstraint(columnNames = {"rule_id", "original_start_time"}))
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ScheduleException {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rule_id", nullable = false)
    private ScheduleRule rule;

    @Column(name = "original_start_time", nullable = false)
    private Instant originalStartTime;

    @Column(name = "new_start_time")
    private Instant newStartTime;

    @Column(name = "new_end_time")
    private Instant newEndTime;

    @Column(name = "new_content", length = 40)
    private String newContent;

    @Column(name = "is_cancelled", nullable = false)
    private Boolean isCancelled = false;

}