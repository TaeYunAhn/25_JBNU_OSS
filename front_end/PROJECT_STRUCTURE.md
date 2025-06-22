# 소중대 활동일지 캘린더 프로젝트

이 문서는 'Callog' 프로젝트의 폴더 및 파일 구조에 대한 설명입니다.

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

#### sidebar/
애플리케이션의 사이드바 관련 컴포넌트들을 포함합니다.
- **ProjectList/**: 사이드바에 표시되는 프로젝트 목록 컴포넌트

### 2. hooks/
애플리케이션의 비즈니스 로직과 상태 관리를 담당하는 커스텀 훅들을 포함합니다.
- **useAuth.js**: 인증 관련 상태와 로직을 관리하는 훅
- **useProject.js**: 프로젝트 데이터 관리와 최적화된 API 호출을 처리하는 훅
- **useSchedule.js**: 일정 데이터 관리와 최적화된 API 호출을 처리하는 훅

### 3. pages/
애플리케이션의 페이지 컴포넌트들이 포함됩니다.
- **Calendar/**: 캘린더 기본 페이지
- **Home/**: 홈페이지
- **Login/**: 로그인 페이지
- **Register/**: 회원가입 페이지

### 4. services/
백엔드 API와의 통신을 담당하는 서비스 모듈들을 포함합니다.
- **api.js**: API 요청을 위한 기본 설정 및 인스턴스
- **authService.js**: 인증 관련 API 호출
- **projectService.js**: 프로젝트 관련 API 호출
- **scheduleService.js**: 일정 관련 API 호출
- **exportService.js**: 데이터 내보내기 관련 API 호출

### 5. contexts/
React Context API를 활용한 전역 상태 관리 컴포넌트들이 포함됩니다.
- **ToastContext.js**: 애플리케이션 전반의 알림 메시지 관리
- **AuthContext.js**: 사용자 인증 상태 관리

### 6. utils/
애플리케이션 전반에서 사용되는 유틸리티 함수들을 포함합니다.
- **dateUtils.js**: 날짜 관련 유틸리티 함수
- **validationUtils.js**: 입력 검증 관련 유틸리티 함수


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
- **FullCalendar**: 캘린더 UI 라이브러리 (core, daygrid, timegrid, interaction)
- **date-fns**: 날짜 조작 및 포맷팅 라이브러리
- **styled-components**: CSS-in-JS 스타일링 라이브러리
- **Testing Library**: 컴포넌트 테스트 도구 (Jest, React Testing Library)


## 프론트엔드 아키텍처

### 1. 컴포넌트 설계

#### 주요 컴포넌트 그룹
1. **페이지 컴포넌트**: Calendar, Login, Home
2. **기능 컴포넌트**: 프로젝트, 일정, 사용자 관리 기능
3. **공통 컴포넌트**: Button, Modal, Form 등 재사용 가능한 UI 컴포넌트

### 2. 스타일 관리 및 일관성

#### 스타일링 접근법
- **컴포넌트 지역 스코프 CSS**: 각 컴포넌트는 자체 CSS 파일(ComponentName.css)을 가짐
- **전역 스타일**: `index.css`에서 폰트, 색상, 기본 스타일 등 전역 스타일 정의
- **변수 활용**: CSS 변수를 활용하여 색상, 간격 등의 디자인 토큰 관리

#### 디자인 일관성 유지 전략
- **색상 팔레트**: 프로젝트 전체에서 일관된 색상 사용을 위한 변수 정의
- **타이포그래피 시스템**: 제목, 본문 등 텍스트 유형별 일관된 스타일 적용
- **컴포넌트 변형**: 기본 컴포넌트의 변형을 통해 다양한 상황에 대응하면서도 일관성 유지

### 3. 라우팅 관리

라우팅은 React Router를 사용하여 관리됩니다:

#### 라우팅 구조
- **중첩 라우팅**: 레이아웃을 공유하는 페이지들을 위한 중첩 라우트 구성
- **인증 보호 라우트**: `PrivateRoute` 컴포넌트를 통해 인증이 필요한 페이지 보호
- **동적 라우팅**: URL 파라미터를 활용한 동적 페이지 렌더링(`/calendar/:year/:month`)

### 4. 서버 통신

#### API 구조화
- **중앙 인스턴스**: [api.js](cci:7://file:///c:/Users/Talon/Desktop/oss/front_end/src/services/api.js:0:0-0:0)에서 기본 설정(baseURL, 헤더, 인터셉터)이 적용된 Axios 인스턴스 관리
- **서비스 모듈화**: 기능별로 분리된 서비스 모듈(`authService`, `projectService`, `scheduleService`, `exportService`)
- **응답 처리 표준화**: 일관된 에러 처리 및 응답 데이터 가공

#### 인증 처리
- **토큰 관리**: JWT 토큰을 localStorage에 저장하고 요청 시 자동으로 헤더에 포함
- **토큰 갱신**: 인증 토큰 만료 시 자동 갱신 로직
- **인증 헤더**: Axios 인터셉터를 통한 인증 헤더 자동 관리

### 5. 상태 관리

#### 주요 상태 관리 전략
- **React 훅 기반**: `useState`, `useEffect`, `useCallback`, `useRef` 등 React 기본 훅 활용
- **도메인별 커스텀 훅**: 비즈니스 로직과 상태를 캡슐화한 도메인 특화 커스텀 훅(`useAuth`, [useProject](cci:1://file:///c:/Users/Talon/Desktop/oss/front_end/src/hooks/useProject.js:9:0-225:2), [useSchedule](cci:1://file:///c:/Users/Talon/Desktop/oss/front_end/src/hooks/useSchedule.js:13:0-266:2))
- **Context API**: 전역 상태(인증, 알림)를 위한 React Context API 사용
- **컴포넌트 로컬 상태**: UI 상태는 해당 컴포넌트 내에서 지역적으로 관리

#### 상태 최적화
- **메모이제이션**: `React.memo`, `useMemo`, `useCallback`을 활용한 불필요한 렌더링 방지
- **상태 분리**: UI 상태와 데이터 상태의 명확한 분리
- **상태 호이스팅**: 공유 상태를 최소한의 필요한 상위 컴포넌트로 끌어올림

#### 비동기 상태 처리
- **로딩/에러 상태**: 비동기 작업의 로딩 및 에러 상태 표준화
- **낙관적 업데이트**: 사용자 경험 향상을 위한, API 응답을 기다리지 않고 UI를 즉시 업데이트
- **상태 지속성**: 필요한 상태의 지속성을 위한 로컬 스토리지 활용