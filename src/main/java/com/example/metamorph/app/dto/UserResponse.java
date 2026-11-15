package com.example.metamorph.app.dto;

import java.time.LocalDateTime;

import com.example.metamorph.common.entity.UserRole;

public record UserResponse(
    Long id,
    String email,
    UserRole role,
    LocalDateTime createdAt
) {}
