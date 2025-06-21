# Calelog CI/CD 배포 가이드 

## 배포 방식: 레지스트리 없는 직접 전송

### 배포 플로우
```
개발자 코드 푸시 → GitHub Actions → Docker 빌드 → EC2 직접 전송 → 자동 배포
```

### 자동화 기능
**Docker 자동 설치**: EC2에 Docker 없으면 자동 설치  
**동적 IP 처리**: EC2 재시작 시 IP 자동 감지  
**컨테이너 자동 재시작**: `restart: always` 정책  
**MySQL 데이터 보존**: 볼륨으로 데이터 영속성  
**헬스체크**: MySQL 완전 초기화 후 백엔드 시작  

## 배포 실행

### 자동 배포
```bash
git push origin main
```

### 수동 배포 (테스트용)
```bash
# 로컬에서 Docker 빌드 테스트
cd back_end && docker build -t calelog-backend:latest .
cd ../front_end && docker build -t calelog-frontend:latest .

## 배포 후 확인사항

### 서비스 접속 확인
- 프론트엔드: http://EC2_IP:3000
- 백엔드 API: http://EC2_IP:8080/swagger-ui/index.html
- 백엔드 헬스체크: http://EC2_IP:8080/actuator/health

### 로그 확인
```bash
# 컨테이너 상태
docker compose ps

# 로그 확인
docker logs calelog-backend
docker logs calelog-frontend  
docker logs calelog-mysql

# JWT Secret 생성 방법
openssl rand -base64 64
```

## 문제 해결

### 일반적인 문제들

**1. Docker 권한 오류**
```bash
sudo usermod -aG docker $USER
# 재로그인 필요
```

**2. 포트 충돌**
```bash
sudo netstat -tlnp | grep :8080
sudo kill -9 PID
```

**3. MySQL 연결 실패**
```bash
# MySQL 컨테이너 로그 확인
docker logs calelog-mysql

# 수동 연결 테스트
docker exec -it calelog-mysql mysql -u root -p
```

**4. 완전 초기화**
```bash
docker compose down
docker system prune -a
docker volume prune
```

---
