package com.jbnu.calelog.service;

import com.jbnu.calelog.entity.Schedule;
import com.jbnu.calelog.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

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

        createHeader(workbook, sheet);
        populateData(workbook, sheet, schedules);

        // 컬럼 자동 크기 조정
        for (int i = 0; i < 6; i++) {
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
     * 엑셀 헤더 생성
     */
    private void createHeader(Workbook workbook, Sheet sheet) {
        CellStyle headerStyle = createHeaderStyle(workbook);

        // 첫 번째 행: 근무일자, 요일, 근무시간, 내용
        Row headerRow1 = sheet.createRow(0);
        String[] headers1 = {"근무일자", "요일", "근무시간", "내용"};
        for (int i = 0; i < headers1.length; i++) {
            Cell cell = headerRow1.createCell(i < 2 ? i : i + 2);
            cell.setCellValue(headers1[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // 셀 병합
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 2, 4)); // 근무시간
        sheet.addMergedRegion(new CellRangeAddress(0, 1, 0, 0)); // 근무일자
        sheet.addMergedRegion(new CellRangeAddress(0, 1, 1, 1)); // 요일
        sheet.addMergedRegion(new CellRangeAddress(0, 1, 5, 5)); // 내용

        // 두 번째 행: 시작, 종료, 시간
        Row headerRow2 = sheet.createRow(1);
        String[] headers2 = {"시작", "종료", "시간"};
        for (int i = 0; i < headers2.length; i++) {
            Cell cell = headerRow2.createCell(i + 2);
            cell.setCellValue(headers2[i]);
            cell.setCellStyle(headerStyle);
        }
    }

    /**
     * 데이터 행 생성
     */
    private void populateData(Workbook workbook, Sheet sheet, List<Schedule> schedules) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yy. M. d.");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        CellStyle dataStyle = createDataStyle(workbook);
        int rowNum = 2;

        for (Schedule schedule : schedules) {
            Row row = sheet.createRow(rowNum++);

            // 근무일자 (yy. M. d. 형식)
            Cell dateCell = row.createCell(0);
            dateCell.setCellValue(schedule.getStartTime().format(dateFormatter));
            dateCell.setCellStyle(dataStyle);

            // 요일 (한글 약자)
            Cell dayOfWeekCell = row.createCell(1);
            dayOfWeekCell.setCellValue(schedule.getStartTime().getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.KOREAN));
            dayOfWeekCell.setCellStyle(dataStyle);

            // 시작 시간 (HH:mm 형식)
            Cell startTimeCell = row.createCell(2);
            startTimeCell.setCellValue(schedule.getStartTime().format(timeFormatter));
            startTimeCell.setCellStyle(dataStyle);

            // 종료 시간 (HH:mm 형식)
            Cell endTimeCell = row.createCell(3);
            endTimeCell.setCellValue(schedule.getEndTime().format(timeFormatter));
            endTimeCell.setCellStyle(dataStyle);

            // 시간 (정수 시간)
            Cell durationCell = row.createCell(4);
            long hours = Duration.between(schedule.getStartTime(), schedule.getEndTime()).toHours();
            durationCell.setCellValue(hours);
            durationCell.setCellStyle(dataStyle);

            // 내용
            Cell contentCell = row.createCell(5);
            contentCell.setCellValue(schedule.getContent());
            contentCell.setCellStyle(dataStyle);
        }
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