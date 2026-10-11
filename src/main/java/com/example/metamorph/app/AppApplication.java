package com.example.metamorph.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the App container.
 * Component scan is intentionally scoped to only the 'app' and 'common'
 * packages — worker beans are excluded from this context.
 */
@SpringBootApplication(scanBasePackages = {
		"com.example.metamorph.app",
		"com.example.metamorph.common"
})
public class AppApplication {

	public static void main(String[] args) {
		SpringApplication.run(AppApplication.class, args);
	}

}
