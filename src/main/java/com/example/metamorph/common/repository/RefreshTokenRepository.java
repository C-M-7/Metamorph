package com.example.metamorph.common.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.metamorph.common.entity.RefreshToken;

@Repository 
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long>{
    Optional<RefreshToken> findByTokenHash(String tokenHash);
}
