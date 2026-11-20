package com.example.metamorph.common.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "file_metadata", indexes = {
    @Index(name = "idx_file_metadata_file_id", columnList = "file_id", unique = true),
    @Index(name = "idx_file_metadata_user_id", columnList = "user_id"),
    @Index(name = "idx_file_metadata_conversion_id", columnList = "conversion_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "file_id", nullable = false, unique = true, length = 36)
    private UUID fileId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "conversion_id", length = 36)
    private UUID conversionId;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_key", length = 500)
    private String fileKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "file_format", nullable = false, length = 20)
    private FileFormat fileFormat;

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    @Enumerated(EnumType.STRING)
    @Column(name = "file_type", nullable = false)
    private FileType fileType;

    @Enumerated(EnumType.STRING)
    @Column(name = "validation_status", nullable = false)
    @Builder.Default
    private ValidationStatus validationStatus = ValidationStatus.PENDING;

    @Column(name = "validation_error", columnDefinition = "TEXT")
    private String validationError;

    @Column(name = "disabled", nullable = false)
    @Builder.Default
    private boolean disabled = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "extras", columnDefinition = "json")
    private String extras;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
