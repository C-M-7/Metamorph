package com.example.metamorph;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

/**
 * Entry point for the Worker container.
 * Scans the full root package; app/web beans are excluded via filter.
 * Web server and Flyway are disabled via application-worker.properties.
 */
@SpringBootApplication
@ComponentScan(
    basePackages = "com.example.metamorph",
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.REGEX,
        pattern = "com\\.example\\.metamorph\\.app\\..*"
    )
)
public class WorkerApplication {
    public static void main(String[] args) {
        SpringApplication.run(WorkerApplication.class, args);
    }
}