package com.example.metamorph.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AppConfigurationRequest(
    @NotBlank(message = "Identifier is required")
    @Size(max = 255, message = "Identifier must not exceed 255 characters")
    String identifier,

    @NotNull(message = "Config JSON is required")
    Object config,

    Boolean disabled
) {}

