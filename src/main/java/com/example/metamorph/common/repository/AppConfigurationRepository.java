package com.example.metamorph.common.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.metamorph.common.entity.AppConfiguration;

@Repository
public interface AppConfigurationRepository extends JpaRepository<AppConfiguration, Long> {
    Optional<AppConfiguration> findByIdentifier(String identifier);
    boolean existsByIdentifier(String identifier);
    Page<AppConfiguration> findAllByDisabledFalse(Pageable pageable);
}
