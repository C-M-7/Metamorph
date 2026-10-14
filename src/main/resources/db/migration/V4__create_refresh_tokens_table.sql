CREATE TABLE refresh_tokens (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    token_hash  VARCHAR(64)  NOT NULL UNIQUE,
    family      VARCHAR(36)  NOT NULL,
    revoked     TINYINT(1)   NOT NULL DEFAULT 0,
    expires_at  TIMESTAMP    NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_rt_family (family),
    INDEX idx_rt_user   (user_id)
);
