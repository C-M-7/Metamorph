package com.example.metamorph;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

/**
 * Entry point for the App container.
 * Scans the full root package; worker beans are excluded via filter.
 */
@SpringBootApplication
@ComponentScan(
    basePackages = "com.example.metamorph",
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.REGEX,
        pattern = "com\\.example\\.metamorph\\.worker\\..*"
    )
)
public class AppApplication {
    public static void main(String[] args) {
        SpringApplication.run(AppApplication.class, args);
    }
}