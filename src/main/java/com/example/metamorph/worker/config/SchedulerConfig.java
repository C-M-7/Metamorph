package com.example.metamorph.worker.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

// Enables Spring scheduled task execution for worker background jobs
@Configuration
@EnableScheduling
public class SchedulerConfig {
}
