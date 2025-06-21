FROM node:18-alpine

WORKDIR /app

# 모든 파일 복사
COPY . .

# 의존성 설치 및 빌드
RUN npm install && npm run build

# Serve로 정적 파일 서빙 (간단)
RUN npm install -g serve

# 포트 노출
EXPOSE 3000

# 애플리케이션 실행
CMD ["serve", "-s", "build", "-l", "3000"]