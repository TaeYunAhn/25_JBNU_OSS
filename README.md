## 개발 환경 실행 가이드

### 🚀 간단한 로컬 개발 (권장)
```bash
# 터미널 1: 백엔드 실행
cd back_end
./gradlew bootRun

# 터미널 2: 프론트엔드 실행  
cd front_end
npm install  # 최초 1회만 실행
npm start
```
- **백엔드**: http://localhost:8080
- **프론트엔드**: http://localhost:3000
- **H2 콘솔**: http://localhost:8080/h2-console
- **Swagger UI**: http://localhost:8080/swagger-ui/index.html

### 🐳 Docker로 전체 시스템 테스트
```bash
# 전체 시스템 (nginx + SSL 포함)
docker compose up -d

# 접속 URL
# HTTP: http://localhost
# HTTPS: https://localhost (Self-signed 인증서 경고 무시)
```

## API 테스트 가이드 (Swagger)

### 1단계: Swagger UI 접속
- URL: http://localhost:8080/swagger-ui/index.html
- 백엔드가 실행 중인 상태에서 접속

### 2단계: JWT 인증 API 테스트

#### 회원가입 (POST /api/auth/signup)
```json
{
  "email": "test@jbnu.ac.kr",
  "password": "password123", 
  "fullName": "김테스트"
}
```

#### 로그인 (POST /api/auth/login)
```json
{
  "email": "test@jbnu.ac.kr",
  "password": "password123"
}
```
→ 응답에서 `accessToken`과 `refreshToken` 복사해두기

#### 토큰 갱신 (POST /api/auth/refresh)
```json
{
  "refreshToken": "로그인에서_받은_refreshToken_붙여넣기"
}
```

### 3단계: JWT 인증으로 API 테스트 방법

#### Swagger UI에서 JWT 토큰 설정
1. 로그인 API에서 받은 `accessToken` 전체를 복사
   ```
   예시: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QGpibm...
   ```

2. Swagger UI 페이지 상단 오른쪽의 🔒 **Authorize** 버튼 클릭

3. 팝업창에서 **Value** 입력란에 다음과 같이 입력:
   ```
   Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QGpibm...
   ```
   ⚠️ **주의**: `Bearer ` (Bearer + 공백) 뒤에 토큰을 붙여야 함

4. **Authorize** 버튼 클릭하여 인증 완료

5. 🔒 표시가 있는 모든 API 테스트 가능 (프로젝트 CRUD, 일정 관리 등)

#### 토큰 만료 시 대응방법
- Access Token은 24시간 후 만료됨
- 만료 시 `/api/auth/refresh` API로 새 토큰 발급
- 또는 다시 로그인하여 새 토큰 획득

## Git Branch 전략

> **메인 브랜치**: main, develop

> **기능 브랜치**: feature
>
> > 브랜치 명명 방식은 feature/[기능이름]

> **핫픽스 브랜치**: hotfix
>
> > main -> hotfix -> main

### 개발 워크플로우
```bash
# 1. 작업 시작 전 필수
git remote update
git pull

# 2. 새 기능 브랜치 생성
git checkout main
git checkout -b feature/기능이름

# 3. 개발 완료 후 커밋 및 푸시
git add .
git commit -m "feat: 기능 설명"
git push -u origin feature/기능이름

# 4. GitHub에서 PR 생성 후 팀원 리뷰 받기
```

## 트러블슈팅

### 백엔드 관련
- **포트 8080 사용 중 오류**: `lsof -ti:8080 | xargs kill -9` 실행 후 재시작
- **H2 콘솔 접속 안됨**: 브라우저에서 http://localhost:8080/h2-console 직접 입력
- **Gradle 빌드 실패**: `./gradlew clean build` 실행

### 프론트엔드 관련  
- **npm install 취약점 경고**: 정상적인 경고입니다. `npm start` 실행 가능
- **포트 3000 사용 중**: 다른 포트 사용하거나 `lsof -ti:3000 | xargs kill -9`
- **모듈 없음 오류**: `rm -rf node_modules package-lock.json && npm install`

### API 연동 관련
- **CORS 오류**: 백엔드와 프론트엔드 모두 실행 중인지 확인
- **API 401 오류**: Swagger에서 JWT 토큰 인증 후 테스트
- **네트워크 오류**: `http://localhost:8080/swagger-ui/index.html`에서 API 직접 테스트

&nbsp;

## Commit, PR시

- Rule 1 : Commit양식은 아래를 따릅니다.
- Rule 2 : 제목은 영어로, 본문은 한글로 작성하여 주세요.

```
# <타입>: <제목>

##### 제목은 최대 50 글자까지만 입력 ############## -> |


# 본문은 위에 작성
######## 본문은 한 줄에 최대 72 글자까지만 입력 ########################### -> |

# 꼬릿말은 아래에 작성: ex) #이슈 번호

# --- COMMIT END ---
# <타입> 리스트
#   feat    : 기능 (새로운 기능)
#   fix     : 버그 (버그 수정)
#   refactor: 리팩토링
#   style   : 스타일 (코드 형식, 세미콜론 추가: 비즈니스 로직에 변경 없음)
#   docs    : 문서 (문서 추가, 수정, 삭제)
#   test    : 테스트 (테스트 코드 추가, 수정, 삭제: 비즈니스 로직에 변경 없음)
#   chore   : 기타 변경사항 (빌드 스크립트 수정 등)
# ------------------
#     제목 첫 글자를 대문자로
#     제목은 명령문으로
#     제목 끝에 마침표(.) 금지
#     제목과 본문을 한 줄 띄워 분리하기
#     본문은 "어떻게" 보다 "무엇을", "왜"를 설명한다.
#     본문에 여러줄의 메시지를 작성할 땐 "-"로 구분
# ------------------
```

```
ex)
docs: Update README

가독성이 더 좋은 commit 메시지로 업데이트 하였습니다.
```

## 주석 Convention

- Rule 3 : 함수, 클래스 단위로 아래 주석 형식을 따라주세요.
  - description은 전체적인 기능, 동작이 복잡하다면 자세하게 써주세요.

```
 /**
  *@author Suin-Jeong, jeongiun@jbnu.ac.kr
  *@date 2023-01-01
  *@description 상단에 고정적으로 위치하는 Header
  *             로고, Main Navigator, 검색창,
  *             KR/EN 버튼, Side Navigator 포함
  */
```

- Rule 4 : 함수 안에 큰 컴포넌트 단위로 한줄주석 혹은 return문 내에 주석을 달아주세요.

```
// return 문 외
// 한줄 주석

{/* return 문 내 */}
{/* 메뉴, 검색창, 언어버튼 */}
{/* 사이드 메뉴 */}
```

## Code Convention

Rule 5 : 기본적인 Convention은 VS Code 확장 Prettier을 사용합니다.

- 파일 저장 시 서식이 자동 지정되도록 Format On Save 기능을 사용해주세요.

## Code Review

Rule 6 : PR된 Code를 Review하시고 이상 없어보이면 LGTM(Look Good To Me) 댓글을 남겨주세요.  
Rule 7 : 더 좋은 방법이나 수정하면 좋을 것 같은 부분 댓글로 남겨주세요.  
Rule 8 : Code에 관련된 부분만 지적하여 주세요.  
Rule 9 : LGTM 3명 즉 3명이상의 Code Review를 통과하면 Merge합니다.

## Issue Convention

Rule 10 : 이슈 작성시 아래의 형식을 따라주세요.

```
## 📒 이슈 내용
> "이슈 내용 작성"

## 📑 상세 내용
1. "상세 내용 1"
2. "상세 내용 2"

## ✔️ 체크리스트
- [ ] 상세 내용 1.
- [ ] 상세 내용 2.
```

## Configuration Management

Rule 11 : 하루의 개발을 시작하기 전에 형상 관리를 위해 다음 명령어를 수행해주세요

- git remote update
- git pull
