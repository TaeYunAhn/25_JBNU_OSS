FROM eclipse-temurin:17-jdk

WORKDIR /app

# 모든 파일 복사 
COPY . .

# Gradle 실행 권한
RUN chmod +x ./gradlew

# 애플리케이션 빌드
RUN ./gradlew bootJar --no-daemon

# 포트 노출
EXPOSE 8080

# 프로덕션 환경으로 실행
ENV SPRING_PROFILES_ACTIVE=prod

# 애플리케이션 실행
CMD ["java", "-jar", "build/libs/calelog-0.0.1-SNAPSHOT.jar"]