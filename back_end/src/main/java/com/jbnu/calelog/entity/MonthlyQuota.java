package com.jbnu.calelog.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-19
 * @description 프로젝트별 월간 목표 시간을 관리하는 엔티티
 *             각 프로젝트마다 월별 필수 활동 시간 설정
 */
@Entity
@Table(name = "monthly_quotas", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "year", "month"}))
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MonthlyQuota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "year", nullable = false)
    private Integer year;

    @Column(name = "month", nullable = false)
    private Integer month;

    @Column(name = "required_hours", nullable = false)
    private Integer requiredHours;

}