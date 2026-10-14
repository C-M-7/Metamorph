package com.example.metamorph;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the App container.
 * Scans only common and app packages; worker beans are completely isolated.
 */
@SpringBootApplication(scanBasePackages = {
    "com.example.metamorph.common",
    "com.example.metamorph.app"
})
public class AppApplication {
    public static void main(String[] args) {
        SpringApplication.run(AppApplication.class, args);
    }
}