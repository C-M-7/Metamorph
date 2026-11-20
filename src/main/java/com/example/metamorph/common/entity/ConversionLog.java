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
@Table(name = "conversion_logs", indexes = {
    @Index(name = "idx_conv_logs_conversion_id", columnList = "conversion_id", unique = true),
    @Index(name = "idx_conv_logs_user_id", columnList = "user_id"),
    @Index(name = "idx_conv_logs_input_file_id", columnList = "input_file_id"),
    @Index(name = "idx_conv_logs_output_file_id", columnList = "output_file_id"),
    @Index(name = "idx_conv_logs_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "conversion_id", nullable = false, unique = true, length = 36)
    private UUID conversionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "input_file_id", nullable = false)
    private FileMetadata inputFile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "output_file_id")
    private FileMetadata outputFile;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_format", nullable = false, length = 20)
    private FileFormat sourceFormat;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_format", nullable = false, length = 20)
    private FileFormat targetFormat;

    @Enumerated(EnumType.STRING)
    @Column(name = "execution_strategy", nullable = false)
    @Builder.Default
    private ExecutionStrategy executionStrategy = ExecutionStrategy.IN_MEMORY;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ConversionStatus status = ConversionStatus.PENDING;

    @Column(name = "row_count")
    private Long rowCount;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "disabled", nullable = false)
    @Builder.Default
    private boolean disabled = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "extras", columnDefinition = "json")
    private String extras;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
