package com.carebot.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Main Spring Boot Application for Carebot Healthcare Backend
 * 
 * This application provides:
 * - Patient management with H2 database
 * - Document upload and storage
 * - Prescription management
 * - RESTful API endpoints
 * - CORS support for React frontend
 * - Automated follow-up scheduling and reminders
 * 
 * @author Carebot Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableScheduling
public class JavaCarebotBackendApplication {

    public static void main(String[] args) {
        System.out.println("🚀 Starting Carebot Healthcare Backend...");
        SpringApplication.run(JavaCarebotBackendApplication.class, args);
        System.out.println("✅ Carebot Backend is running!");
        System.out.println("📊 H2 Console: http://localhost:8080/api/h2-console");
        System.out.println("📋 API Docs: http://localhost:8080/api/swagger-ui.html");
        System.out.println("🩺 Health Check: http://localhost:8080/api/actuator/health");
    }

    /**
     * Configure CORS for React frontend
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:3000", "http://127.0.0.1:3000")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true)
                        .maxAge(3600);
            }
        };
    }
}
