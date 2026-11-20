CREATE TABLE file_metadata (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_id VARCHAR(36) NOT NULL UNIQUE,
    user_id BIGINT NULL,
    conversion_id VARCHAR(36) NULL,
    file_name VARCHAR(255) NOT NULL,
    file_key VARCHAR(500) NULL,
    file_format VARCHAR(20) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    file_type ENUM('INPUT', 'OUTPUT') NOT NULL,
    validation_status ENUM('PENDING', 'VALID', 'INVALID') NOT NULL DEFAULT 'PENDING',
    validation_error TEXT NULL,
    disabled BOOLEAN NOT NULL DEFAULT FALSE,
    extras JSON NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_file_metadata_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_file_metadata_user_id (user_id),
    INDEX idx_file_metadata_conversion_id (conversion_id)
);
