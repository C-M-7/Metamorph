package com.example.metamorph.common.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.metamorph.common.entity.FileMetadata;

@Repository
public interface FileMetadataRepository extends JpaRepository<FileMetadata, Long> {

    Optional<FileMetadata> findByFileId(UUID fileId);

    Optional<FileMetadata> findByFileIdAndDisabledFalse(UUID fileId);

    List<FileMetadata> findByConversionId(UUID conversionId);

    List<FileMetadata> findByConversionIdAndDisabledFalse(UUID conversionId);

    List<FileMetadata> findByUserId(Long userId);

    List<FileMetadata> findByUserIdAndDisabledFalse(Long userId);
}
