package com.jbnu.calelog.service;

import com.jbnu.calelog.entity.Schedule;
import com.jbnu.calelog.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-21
 * @description 활동일지 엑셀 내보내기 서비스
 *             HWP 호환 XLSX 형식으로 활동 내역을 생성
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExportService {

    private final ScheduleRepository scheduleRepository;

    /**
     * 활동일지 엑셀 파일 생성
     * @param year 년도
     * @param month 월
     * @param projectId 프로젝트 ID (선택사항)
     * @param userId 사용자 ID
     * @return 엑셀 파일 바이트 배열
     * @throws IOException 파일 생성 중 오류
     */
    @Transactional(readOnly = true)
    public byte[] generateActivityReport(int year, int month, Long projectId, Long userId) throws IOException {
        log.info("ExportService.generateActivityReport 호출됨 - year: {}, month: {}, projectId: {}, userId: {}", year, month, projectId, userId);
        
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        log.info("조회 기간: {} ~ {}", startDateTime, endDateTime);

        List<Schedule> schedules = scheduleRepository.findSchedulesForExport(userId, startDateTime, endDateTime, projectId);
        
        log.info("조회된 일정 개수: {}", schedules.size());
        
        // 각 일정의 상세 정보 로깅
        for (Schedule schedule : schedules) {
            log.info("일정 정보 - ID: {}, 제목: {}, 타입: {}, 시작시간: {}, 종료시간: {}, 프로젝트: {}", 
                schedule.getId(), 
                schedule.getTitle(), 
                schedule.getType(), 
                schedule.getStartTime(), 
                schedule.getEndTime(),
                schedule.getProject() != null ? schedule.getProject().getId() : "없음");
        }
        
        if (schedules.isEmpty()) {
            log.warn("해당 조건에 맞는 일정이 없습니다.");
            return new byte[0];
        }

        log.info("엑셀 파일 생성 시작...");
        
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("활동일지_" + year + "_" + month);

        // 프로젝트별로 그룹화
        Map<String, List<Schedule>> schedulesByProject = schedules.stream()
            .collect(Collectors.groupingBy(schedule -> {
                if (schedule.getProject() != null) {
                    return schedule.getProject().getName();
                } else {
                    return "개인 활동";
                }
            }));

        int currentRow = 0;
        
        // 각 프로젝트별로 표 생성
        for (Map.Entry<String, List<Schedule>> entry : schedulesByProject.entrySet()) {
            String projectName = entry.getKey();
            List<Schedule> projectSchedules = entry.getValue();
            
            // 프로젝트 제목 추가
            if (currentRow > 0) {
                currentRow += 2; // 프로젝트 간 간격
            }
            createProjectTitle(workbook, sheet, projectName, currentRow);
            currentRow += 1;
            
            // 헤더 생성
            createHeaderAtRow(workbook, sheet, currentRow);
            currentRow += 2;
            
            // 데이터 입력
            currentRow = populateDataAtRow(workbook, sheet, projectSchedules, currentRow);
            
            // 합계 행 추가
            addProjectSummary(workbook, sheet, projectSchedules, currentRow);
            currentRow += 1;
        }

        // 컬럼 자동 크기 조정
        for (int i = 0; i < 7; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        workbook.write(bos);
        workbook.close();
        
        byte[] result = bos.toByteArray();
        log.info("엑셀 파일 생성 완료 - 파일 크기: {} bytes", result.length);
        
        return result;
    }

    /**
     * 프로젝트 제목 생성
     */
    private void createProjectTitle(Workbook workbook, Sheet sheet, String projectName, int rowIndex) {
        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 12);
        titleStyle.setFont(titleFont);
        titleStyle.setAlignment(HorizontalAlignment.LEFT);
        
        Row titleRow = sheet.createRow(rowIndex);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("■ " + projectName);
        titleCell.setCellStyle(titleStyle);
    }

    /**
     * 지정된 행에 헤더 생성
     */
    private void createHeaderAtRow(Workbook workbook, Sheet sheet, int startRow) {
        CellStyle headerStyle = createHeaderStyle(workbook);

        Row headerRow1 = sheet.createRow(startRow);
        String[] headers1 = {"근무일자", "요일", "근무시간", "내용"};
        for (int i = 0; i < headers1.length; i++) {
            int colIndex = i < 2 ? i : (i == 2 ? i : i + 3);
            Cell cell = headerRow1.createCell(colIndex);
            cell.setCellValue(headers1[i]);
            cell.setCellStyle(headerStyle);
        }
        
        sheet.addMergedRegion(new CellRangeAddress(startRow, startRow, 2, 5));
        sheet.addMergedRegion(new CellRangeAddress(startRow, startRow + 1, 0, 0));
        sheet.addMergedRegion(new CellRangeAddress(startRow, startRow + 1, 1, 1));
        sheet.addMergedRegion(new CellRangeAddress(startRow, startRow + 1, 6, 6));

        Row headerRow2 = sheet.createRow(startRow + 1);
        String[] headers2 = {"시작", "~", "종료", "시간"};
        for (int i = 0; i < headers2.length; i++) {
            Cell cell = headerRow2.createCell(i + 2);
            cell.setCellValue(headers2[i]);
            cell.setCellStyle(headerStyle);
        }
    }

    /**
     * 지정된 행에 데이터 입력
     */
    private int populateDataAtRow(Workbook workbook, Sheet sheet, List<Schedule> schedules, int startRow) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yy. M. d.");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        CellStyle dataStyle = createDataStyle(workbook);
        int rowNum = startRow;

        for (Schedule schedule : schedules) {
            Row row = sheet.createRow(rowNum++);

            Cell dateCell = row.createCell(0);
            dateCell.setCellValue(schedule.getStartTime().format(dateFormatter));
            dateCell.setCellStyle(dataStyle);

            Cell dayOfWeekCell = row.createCell(1);
            dayOfWeekCell.setCellValue(schedule.getStartTime().getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.KOREAN));
            dayOfWeekCell.setCellStyle(dataStyle);

            Cell startTimeCell = row.createCell(2);
            startTimeCell.setCellValue(schedule.getStartTime().format(timeFormatter));
            startTimeCell.setCellStyle(dataStyle);

            Cell separatorCell = row.createCell(3);
            separatorCell.setCellValue("~");
            separatorCell.setCellStyle(dataStyle);

            Cell endTimeCell = row.createCell(4);
            endTimeCell.setCellValue(schedule.getEndTime().format(timeFormatter));
            endTimeCell.setCellStyle(dataStyle);

            Cell durationCell = row.createCell(5);
            long hours = Duration.between(schedule.getStartTime(), schedule.getEndTime()).toHours();
            durationCell.setCellValue(hours);
            durationCell.setCellStyle(dataStyle);

            Cell contentCell = row.createCell(6);
            contentCell.setCellValue(schedule.getContent());
            contentCell.setCellStyle(dataStyle);
        }
        
        return rowNum; // 다음 행 번호 반환
    }

    /**
     * 프로젝트 합계 행 추가
     */
    private void addProjectSummary(Workbook workbook, Sheet sheet, List<Schedule> schedules, int rowIndex) {
        CellStyle summaryStyle = workbook.createCellStyle();
        Font boldFont = workbook.createFont();
        boldFont.setBold(true);
        summaryStyle.setFont(boldFont);
        summaryStyle.setAlignment(HorizontalAlignment.CENTER);
        summaryStyle.setBorderTop(BorderStyle.THIN);
        summaryStyle.setBorderBottom(BorderStyle.THIN);
        summaryStyle.setBorderLeft(BorderStyle.THIN);
        summaryStyle.setBorderRight(BorderStyle.THIN);
        summaryStyle.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex());
        summaryStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        
        Row summaryRow = sheet.createRow(rowIndex);
        
        Cell totalLabelCell = summaryRow.createCell(0);
        totalLabelCell.setCellValue("총 근무시간");
        totalLabelCell.setCellStyle(summaryStyle);
        
        // 빈 셀들도 스타일 적용
        for (int i = 1; i < 5; i++) {
            Cell emptyCell = summaryRow.createCell(i);
            emptyCell.setCellStyle(summaryStyle);
        }
        
        long totalHours = schedules.stream()
            .mapToLong(schedule -> Duration.between(schedule.getStartTime(), schedule.getEndTime()).toHours())
            .sum();
            
        Cell totalHoursCell = summaryRow.createCell(5);
        totalHoursCell.setCellValue(totalHours + " 시간");
        totalHoursCell.setCellStyle(summaryStyle);
        
        Cell lastCell = summaryRow.createCell(6);
        lastCell.setCellStyle(summaryStyle);
        
        // 합계 행 병합
        sheet.addMergedRegion(new CellRangeAddress(rowIndex, rowIndex, 0, 4));
    }


    /**
     * 헤더 스타일 생성
     */
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    /**
     * 데이터 스타일 생성
     */
    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }
} 