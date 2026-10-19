package com.example.metamorph.worker.cron;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.metamorph.common.repository.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;

// Background cron job responsible for periodically purging expired refresh tokens
@Component
@RequiredArgsConstructor
public class RefreshTokenCleanupCron {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenCleanupCron.class);
    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");
    private static final DateTimeFormatter IST_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss z");

    private final RefreshTokenRepository refreshTokenRepository;

    // Purges refresh tokens whose expiry timestamp has passed (runs daily at midnight)
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void cleanupExpiredTokens() {
        Instant now = Instant.now();
        String istStartTime = now.atZone(IST_ZONE).format(IST_FORMATTER);
        log.info("Starting expired refresh token cleanup cron job at {}", istStartTime);
        int deletedCount = refreshTokenRepository.deleteExpired(now);
        log.info("Expired refresh token cleanup completed. Deleted {} token(s)", deletedCount);
    }
}
