package com.carebot.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

/**
 * Simplified configuration that excludes JPA to avoid JAXB conflicts
 * This allows the server to start and demonstrate free WhatsApp functionality
 */
@Configuration
@Profile("simple")
@EnableAutoConfiguration(exclude = {
    DataSourceAutoConfiguration.class,
    HibernateJpaAutoConfiguration.class
})
public class SimplifiedConfig {
    // Configuration to run without database dependencies
}
