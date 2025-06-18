package com.jbnu.calelog.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@OpenAPIDefinition(
    info = @Info(
        title = "Calelog API", 
        version = "v1.0.0",
        description = "전북대 SW사업단 학생을 위한 일정 관리 및 활동일지 시스템"
    )
)
@Configuration
public class SwaggerConfig {
    
    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("calelog-api")
                .pathsToMatch("/api/**")
                .build();
    }
}