# 소중대 활동일지 캘린더 프로젝트

이 문서는 '소중대 활동일지 캘린더' 프로젝트의 폴더 및 파일 구조에 대한 설명입니다.

## 설치 및 실행 방법

### 요구사항

- Node.js 14.x 이상
- npm 6.x 이상

### 프로젝트 설치

1. 저장소 복제
```bash
git clone [repository-url]
cd front_end
```

2. 종속성 설치
```bash
npm install
```

### 개발 서버 실행

#### 명령 프롬프트(CMD) 사용

```bash
cd front_end
npm start
```

#### PowerShell 사용 시 (실행 정책 문제 발생할 경우)

1. PowerShell을 관리자 권한으로 실행
2. 실행 정책 변경 후 실행 (현재 세션에만 적용):
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
cd front_end
npm start
```

### 빌드

배포용 빌드:
```bash
npm run build
```

### 테스트

테스트 실행:
```bash
npm test
```

### 기본 접속 정보

- 개발 서버: http://localhost:3000
- 기본 로그인 정보: test / password (목업 로그인 테스트용)

## 폴더 구조 개요

```
front_end/
├── public/           # 정적 파일 디렉토리
├── src/              # 소스 코드 디렉토리
│   ├── assets/       # 이미지, 폰트 등 정적 자원
│   ├── components/   # 재사용 가능한 컴포넌트
│   ├── constants/    # 상수 정의
│   ├── features/     # 기능별 모듈
│   ├── hooks/        # 커스텀 React 훅
│   ├── mocks/        # API 모킹 관련 파일
│   ├── pages/        # 페이지 컴포넌트
│   ├── services/     # API 서비스
│   ├── store/        # 상태 관리
│   └── utils/        # 유틸리티 함수
```

## 주요 디렉토리 상세 설명

### 1. components/

재사용 가능한 UI 컴포넌트들을 포함합니다. 기능과 관심사에 따라 하위 디렉토리로 구분되어 있습니다.

#### calendar/
캘린더 관련 컴포넌트들을 포함합니다.
- **CalendarToolbar/**: 캘린더 상단의 네비게이션 및 제어 도구 모음
- **ScheduleDetail/**: 일정 상세 정보 표시 컴포넌트
- **ScheduleForm/**: 일정 생성 및 수정을 위한 폼 컴포넌트
- **ScheduleModal/**: 일정 생성, 수정, 삭제를 위한 모달 컴포넌트

#### common/
애플리케이션 전체에서 공통으로 사용되는 컴포넌트들이 포함됩니다.
- **Modal/**: 재사용 가능한 모달 컴포넌트

#### project/
프로젝트 관리 관련 컴포넌트들을 포함합니다.
- **ProjectForm/**: 프로젝트 생성 및 수정을 위한 폼 컴포넌트
- **ProjectList/**: 프로젝트 목록 표시 컴포넌트
- **ProjectModal/**: 프로젝트 생성 및 수정을 위한 모달 컴포넌트

### 2. hooks/

애플리케이션에서 사용되는 커스텀 React 훅들이 포함됩니다.
- **useAuth.js**: 인증 관련 상태 및 함수를 제공하는 훅
- **useProject.js**: 프로젝트 데이터 관리를 위한 훅 
- **useSchedule.js**: 일정 데이터 관리를 위한 훅

### 3. services/

API 통신을 담당하는 서비스 모듈들이 포함됩니다.
- **api.js**: Axios 인스턴스 설정
- **authService.js**: 인증 관련 API 호출
- **projectService.js**: 프로젝트 관련 API 호출
- **scheduleService.js**: 일정 관련 API 호출
- **exportService.js**: 활동일지 내보내기 기능 관련 API 호출

### 4. pages/

애플리케이션의 페이지 컴포넌트들이 포함됩니다.
- **Calendar/**: 메인 캘린더 페이지
- **Home/**: 홈 페이지
- **Login/**: 로그인 페이지

### 5. mocks/

개발 중 백엔드 API를 모킹하기 위한 파일들이 포함됩니다.
- **handlers.js**: API 요청에 대한 모킹 핸들러
- **browser.js**: 브라우저 환경 모킹 설정
- **data/**: 모킹 데이터 파일들

### 6. features/

기능별로 구분된 모듈들이 포함됩니다.
- **auth/**: 인증 관련 기능
- **projects/**: 프로젝트 관리 관련 기능
- **schedules/**: 일정 관리 관련 기능

## 주요 파일 설명

### App.js

애플리케이션의 진입점으로, 라우팅 설정과 전역 상태 제공자(Provider)가 정의되어 있습니다.

### index.js

React 애플리케이션의 루트 파일로, App 컴포넌트를 DOM에 렌더링합니다.

## 컴포넌트 구조

각 컴포넌트 폴더는 일반적으로 다음과 같은 구조를 가집니다:
```
ComponentName/
├── index.js       # 컴포넌트 메인 파일
└── ComponentName.css  # 컴포넌트 스타일
```

## 페이지 구조

각 페이지 폴더는 일반적으로 다음과 같은 구조를 가집니다:
```
PageName/
├── index.js       # 페이지 컴포넌트
└── PageName.css   # 페이지 스타일
```

## 기술 스택 요약

- **React.js**: UI 라이브러리
- **React Router**: 라우팅
- **Axios**: HTTP 클라이언트
- **MSW (Mock Service Worker)**: API 모킹
- **FullCalendar**: 캘린더 UI 라이브러리

## 상태 관리

이 프로젝트는 React의 Context API와 커스텀 훅을 사용하여 상태를 관리합니다:
- **useAuth**: 인증 상태 관리
- **useProject**: 프로젝트 데이터 관리
- **useSchedule**: 일정 데이터 관리

## 향후 개발 계획

1. 백엔드 API 연동
2. 테스트 코드 작성
3. 성능 최적화
4. React Native (Expo)를 활용한 모바일 앱 버전 개발

## 백엔드 통합 시 변경/제거될 파일

백엔드 API와 통합 시 다음 파일들은 제거되거나 크게 수정될 예정입니다.

### 1. 완전히 제거될 파일/폴더:

- **`/src/mocks/`** 폴더 전체:
  - `handlers.js` - 목업 API 요청 처리기
  - `browser.js` - 브라우저 환경에서 MSW 설정 
  - `/src/mocks/data/` - 목업 데이터 파일들 

- **`setupTests.js`** 파일 내 MSW 관련 설정

### 2. 대폭 수정될 파일들:

- **서비스 파일들**:
  - `authService.js` - 실제 인증 API 호출로 변경
  - `projectService.js` - 실제 프로젝트 엔드포인트 사용
  - `scheduleService.js` - 실제 일정 엔드포인트 사용
  - `exportService.js` - 실제 내보내기 기능 사용
  
  이 파일들은 목업 데이터 대신 실제 백엔드 엔드포인트를 호출하도록 URL과 요청 형식을 수정해야 합니다.

- **`api.js`**:
  - 실제 백엔드 기본 URL로 업데이트
  - 토큰 관리 및 인증 헤더 설정 변경 가능

### 3. 부분적으로 수정될 파일들:

- **커스텀 훅**: 
  - `useAuth.js`
  - `useProject.js` 
  - `useSchedule.js`
  
  이 파일들의 내부 로직은 유지하되, 서비스 호출 부분에서 오류 처리나 데이터 형식 변환 부분이 수정될 수 있습니다.

- **`App.js`** 또는 **`index.js`**:
  - MSW 설정 코드 제거

프론트엔드의 컴포넌트 구조와 UI 로직은 대부분 그대로 유지되며, 주로 데이터를 가져오거나 저장하는 부분만 변경됩니다.
