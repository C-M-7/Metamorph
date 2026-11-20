package com.example.metamorph.common.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.metamorph.common.entity.ConversionLog;
import com.example.metamorph.common.entity.ConversionStatus;

@Repository
public interface ConversionLogRepository extends JpaRepository<ConversionLog, Long> {

    Optional<ConversionLog> findByConversionId(UUID conversionId);

    Optional<ConversionLog> findByConversionIdAndDisabledFalse(UUID conversionId);

    List<ConversionLog> findByUserId(Long userId);

    List<ConversionLog> findByUserIdAndDisabledFalse(Long userId);

    Page<ConversionLog> findByUserId(Long userId, Pageable pageable);

    Page<ConversionLog> findByUserIdAndDisabledFalse(Long userId, Pageable pageable);

    List<ConversionLog> findByStatus(ConversionStatus status);

    List<ConversionLog> findByStatusAndDisabledFalse(ConversionStatus status);
}
