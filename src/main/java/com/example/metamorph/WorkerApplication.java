package com.example.metamorph;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Worker container.
 * Scans the full root package; app/web beans are excluded via filter.
 * Web server and Flyway are disabled via application-worker.properties.
 */
@SpringBootApplication(scanBasePackages = {
    "com.example.metamorph.common",
    "com.example.metamorph.worker"
})
public class WorkerApplication {
    public static void main(String[] args) {
        SpringApplication.run(WorkerApplication.class, args);
    }
}