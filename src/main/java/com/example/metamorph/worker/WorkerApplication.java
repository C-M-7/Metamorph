package com.example.metamorph.worker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Worker container.
 * Component scan is intentionally scoped to only the 'worker' and 'common'
 * packages — app/web beans are excluded from this context.
 * Web server and Flyway are disabled via application-worker.properties.
 */
@SpringBootApplication(scanBasePackages = {
		"com.example.metamorph.worker",
		"com.example.metamorph.common"
})
public class WorkerApplication {

	public static void main(String[] args) {
		SpringApplication.run(WorkerApplication.class, args);
	}

}
