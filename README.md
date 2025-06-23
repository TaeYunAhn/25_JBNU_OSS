# Calelog - 소중대 활동일지 자동화 시스템

> **전북대학교 SW중심대학사업단 학생들을 위한 일정 관리 및 활동일지 자동 생성 플랫폼**

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Spring_Boot-3.5.0-6DB33F?style=for-the-badge&logo=spring&logoColor=white" />
  <img src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Docker-24.0.2-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Nginx-Alpine-009639?style=for-the-badge&logo=nginx&logoColor=white" />
  <img src="https://img.shields.io/badge/AWS_EC2-Ubuntu-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
  <img src="https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" />
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" />
  <img src="https://img.shields.io/badge/Let's_Encrypt-003A70?style=for-the-badge&logo=letsencrypt&logoColor=white" />
</p>

---

## 목차

- [프로젝트 개요](#-프로젝트-개요)
- [문제 정의 및 해결책](#-문제-정의-및-해결책)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시스템 아키텍처](#-시스템-아키텍처)
- [핵심 구현 사항](#-핵심-구현-사항)
- [로컬 실행 가이드](#-로컬-실행-가이드)

---

## 프로젝트 개요

<div align="center">
  <img src="https://github.com/user-attachments/assets/b9fe4d93-a8e6-4020-ba7c-67542b4104cf" width="1000" alt="메인 화면">
</div>

**Calelog**(Calendar + Log)는 전북대학교 SW중심대학사업단 학생들이 매월 작성해야 하는 활동일지의 번거로움을 해결하기 위해 개발된 웹 애플리케이션입니다.

### 핵심 가치

- **시간 효율성**: 활동일지 작성 시간을 **30분에서 3분으로 단축** (90% 개선)
- **정확성 보장**: 서버 단 시간 중복 검증으로 **인적 오류 완전 제거**
- **사용자 경험**: 직관적인 캘린더 UI와 원클릭 Excel 생성으로 **학습 곡선 최소화**

### 배포 정보

- **운영 사이트**: [https://callog.o-r.kr](https://callog.o-r.kr)
- **안드로이드 앱**: [APK 다운로드](https://drive.google.com/file/d/1yURR8JMxy8Vay_0-Hee78nD35ZGf6vvK/view?usp=sharing)

### 팀 구성

| 이름 | 역할 | GitHub |
|------|------|--------|
| **김담은** | Frontend | [@dameun2224](https://github.com/dameun2224) |
| **김소운** | Designer | [@rlathdns](https://github.com/rlathdns) |
| **안태윤** | Backend, Infra | [@TaeYunAhn](https://github.com/TaeYunAhn) |
| **배지혁** | Backend, DevOps | [@qowlgur121](https://github.com/qowlgur121) |

---

## 문제 정의 및 해결책

### 기존 문제점

전북대학교 SW중심대학사업단 학생들은 **매월 활동일지를 수기로 작성**해야 하는 상황에서 다음과 같은 문제를 겪고 있었습니다:

1. **복잡한 일정 관리**
   - TA 업무, 연구실 활동, 동아리, 개인 수업 등 다양한 활동의 시간 중복 확인 필요
   - 수동으로 모든 일정을 대조하며 활동일지 작성

2. **비효율적인 작업 과정**
   - 월말마다 HWP 양식에 표를 그리고 활동 내역을 일일이 기입
   - 시간 계산 실수로 인한 재작성 빈발
   - 학생서명란을 위한 인쇄 과정 필수

3. **휴먼 에러 발생**
   - 일정 중복으로 인한 활동 불가능 상황
   - 총 시간 계산 오류
   - 활동일지 형식 불일치

### 해결책

**Calelog**는 이러한 문제들을 다음과 같이 해결합니다:

- **통합 일정 관리**: 구글 캘린더 스타일의 직관적 UI로 모든 활동을 한 화면에서 관리
- **자동 중복 검증**: 서버에서 실시간으로 시간 중복을 검증하여 충돌 방지
- **원클릭 활동일지**: HWP 호환 XLSX 파일을 자동 생성하여 즉시 다운로드

---

## 주요 기능

### 1. 사용자 인증 시스템
- JWT 기반 로그인/회원가입
- 자동 토큰 갱신으로 끊김 없는 사용자 경험
- 사용자별 완전한 데이터 격리

### 2. 프로젝트 관리
- **CRUD 기능**: 프로젝트 생성, 수정, 삭제
- **시각적 구분**: 프로젝트별 색상 코드 지정
- **목표 관리**: 월별 필수 활동 시간 설정
- **실시간 통계**: 진행률, 현재 월 시간, 활성 상태 자동 계산

### 3. 일정 관리
- **직관적 캘린더**: FullCalendar 기반 드래그 앤 드롭 지원
- **일정 유형**: PROJECT(활동) / INACTIVE(비활동) 구분
- **반복 일정**: 매일/매주/매월 패턴 지원
- **중복 검증**: 서버에서 실시간 시간 충돌 검사

### 4. 활동일지 자동 생성
- **HWP 호환**: 소중대 공식 양식과 완벽 호환되는 XLSX 파일 생성
- **프로젝트별 분리**: 각 프로젝트의 활동일지를 별도 표로 구성
- **자동 계산**: 총 활동 시간 자동 산출
- **즉시 다운로드**: 브라우저에서 바로 파일 다운로드

### 5. PWA 지원
- **모바일 최적화**: 스마트폰에서 네이티브 앱처럼 사용
- **오프라인 지원**: Service Worker 기반 캐싱
- **홈화면 추가**: 모바일 홈화면에 앱 아이콘으로 설치 가능

---

## 🛠 기술 스택

### Frontend
| 분야 | 기술 | 버전 | 역할 |
|------|------|------|------|
| **프레임워크** | React | 18.2.0 | UI 라이브러리 |
| **상태 관리** | Context API + Hooks | - | 전역 상태 관리 |
| **라우팅** | React Router | 6.15.0 | SPA 라우팅 |
| **캘린더** | FullCalendar | 6.1.8 | 대화형 캘린더 UI |
| **스타일링** | Styled Components | 6.0.7 | CSS-in-JS |
| **HTTP 클라이언트** | Axios | 1.4.0 | API 통신 |
| **PWA** | Workbox | - | 오프라인 지원 |

### Backend
| 분야 | 기술 | 버전 | 역할 |
|------|------|------|------|
| **프레임워크** | Spring Boot | 3.5.0 | 애플리케이션 백본 |
| **언어** | Java | 17 | 주 개발 언어 |
| **보안** | Spring Security + JWT | 6.5.0 | 인증/인가 시스템 |
| **ORM** | Spring Data JPA | 3.5.0 | 객체-관계 매핑 |
| **데이터베이스** | MySQL / H2 | 8.0 / 2.3.232 | 데이터 영속성 |
| **API 문서** | SpringDoc OpenAPI | 2.8.9 | API 명세 자동화 |
| **Excel 처리** | Apache POI | 5.2.4 | XLSX 파일 생성 |

### DevOps & Infrastructure
| 분야 | 기술 | 버전 | 역할 |
|------|------|------|------|
| **컨테이너** | Docker | 24.0.2 | 애플리케이션 컨테이너화 |
| **오케스트레이션** | Docker Compose | V2 | 멀티 컨테이너 관리 |
| **CI/CD** | GitHub Actions | - | 자동 빌드 및 배포 |
| **클라우드** | AWS EC2 | Ubuntu 24.04 | 서버 호스팅 |
| **웹서버** | Nginx | Alpine | 리버스 프록시, SSL 처리 |
| **SSL** | Let's Encrypt | - | HTTPS 인증서 |

---

## 시스템 아키텍처

### 전체 시스템 구조

<div align="center">
  <img src="https://github.com/user-attachments/assets/0b77f860-e81e-4d4f-9003-9ef47e631cd2" width="1000" alt="시스템 아키텍처">
</div>

### CI/CD 파이프라인

<div align="center">
  <img src="https://github.com/user-attachments/assets/33f3ac39-c1e6-42c1-89a3-13aab276152c" width="1000" alt="CI/CD">
</div>

---

## 핵심 구현 사항

### 1. 서버 단 시간 중복 검증

```java
public void validateScheduleConflict(Schedule newSchedule) {
    List<Schedule> conflicts = scheduleRepository
        .findConflictingSchedules(
            newSchedule.getUserId(),
            newSchedule.getStartTime(),
            newSchedule.getEndTime(),
            newSchedule.getId()
        );
    
    if (!conflicts.isEmpty()) {
        throw new ScheduleConflictException(conflicts);
    }
}
```

### 2. 프로젝트 통계 실시간 계산

```java
public ProjectStatistics calculateStatistics(Long projectId, int year, int month) {
    List<Schedule> monthlySchedules = scheduleRepository
        .findByProjectIdAndYearAndMonth(projectId, year, month);
    
    double totalHours = monthlySchedules.stream()
        .mapToDouble(this::calculateDuration)
        .sum();
    
    double progressRate = (totalHours / project.getMonthlyRequiredHours()) * 100;
    
    return new ProjectStatistics(totalHours, progressRate, isActive);
}
```

### 3. HWP 호환 Excel 생성

```java
public byte[] generateActivityReport(int year, int month) {
    try (Workbook workbook = new XSSFWorkbook()) {
        Sheet sheet = workbook.createSheet("활동일지");
        
        for (Project project : projects) {
            createProjectTable(sheet, project, schedules);
        }
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        return outputStream.toByteArray();
    }
}
```

### 4. JWT 기반 인증 시스템

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                  HttpServletResponse response,
                                  FilterChain filterChain) {
        String token = extractTokenFromHeader(request);
        
        if (token != null && jwtUtil.validateToken(token)) {
            String userEmail = jwtUtil.getEmailFromToken(token);
            Authentication auth = createAuthentication(userEmail);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        
        filterChain.doFilter(request, response);
    }
}
```

### 5. Docker 기반 멀티 컨테이너 배포

```yaml
services:
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_DATABASE=calelog
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
    
  backend:
    image: calelog-backend:latest
    depends_on: [mysql]
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - CALELOG_JWT_SECRET=${CALELOG_JWT_SECRET}
    
  frontend:
    image: calelog-frontend:latest
    
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on: [frontend, backend]
```

---

## 로컬 실행 가이드

### 빠른 시작 

```bash
# 1. 백엔드 실행 (터미널 1)
cd back_end
./gradlew bootRun

# 2. 프론트엔드 실행 (터미널 2)
cd front_end
npm install
npm start
```

**접속 정보**:
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui/index.html
- H2 콘솔: http://localhost:8080/h2-console

### Docker로 전체 시스템 실행

```bash
# 전체 시스템 (MySQL + 백엔드 + 프론트엔드 + Nginx)
docker compose up -d

# 접속
# HTTP: http://localhost
# HTTPS: https://localhost (Self-signed 인증서)
```

### API 테스트 (Swagger UI)

1. **회원가입**: POST `/api/auth/signup`
2. **로그인**: POST `/api/auth/login` → `accessToken` 복사
3. **인증 설정**: Swagger UI 상단 🔒 버튼 → `Bearer {토큰}` 입력
4. **API 테스트**: 프로젝트/일정 CRUD 기능 테스트

---
