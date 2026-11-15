package com.example.metamorph.app.dto;

import tools.jackson.databind.JsonNode;

public record AppConfigurationResponse(
    Long id,
    String identifier,
    JsonNode config,
    boolean disabled
) {}
