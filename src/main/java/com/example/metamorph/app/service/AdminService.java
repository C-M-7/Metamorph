package com.example.metamorph.app.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.metamorph.app.dto.AppConfigurationRequest;
import com.example.metamorph.app.dto.AppConfigurationResponse;
import com.example.metamorph.app.dto.UserResponse;
import com.example.metamorph.common.entity.AppConfiguration;
import com.example.metamorph.common.repository.AppConfigurationRepository;
import com.example.metamorph.common.repository.UserRepository;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class AdminService {
    private final UserRepository userRepository;
    private final AppConfigurationRepository appConfigurationRepository;
    private final ObjectMapper objectMapper;

    // Retrieves latest users sorted by id descending with pagination
    public Page<UserResponse> getUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return userRepository.findAll(pageable)
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getEmail(),
                        user.getRole(),
                        user.getCreatedAt()
                ));
    }

    // Creates a new app configuration with valid JSON
    public AppConfigurationResponse createConfiguration(AppConfigurationRequest req) {
        String trimmedIdentifier = req.identifier().trim();
        if (appConfigurationRepository.existsByIdentifier(trimmedIdentifier)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Configuration identifier already exists: " + trimmedIdentifier);
        }

        String serializedConfig = serializeConfig(req.config());
        boolean disabled = req.disabled() != null && req.disabled();

        AppConfiguration entity = AppConfiguration.builder()
                .identifier(trimmedIdentifier)
                .config(serializedConfig)
                .disabled(disabled)
                .build();

        return toResponse(appConfigurationRepository.save(entity));
    }

    // Reads all active (non-disabled) app configurations with pagination sorted by id descending
    public Page<AppConfigurationResponse> getConfigurations(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return appConfigurationRepository.findAllByDisabledFalse(pageable).map(this::toResponse);
    }

    // Reads a single configuration by id
    public AppConfigurationResponse getConfigurationById(Long id) {
        return appConfigurationRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Configuration not found for id: " + id));
    }

    // Updates an existing configuration
    public AppConfigurationResponse updateConfiguration(Long id, AppConfigurationRequest req) {
        AppConfiguration entity = appConfigurationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Configuration not found for id: " + id));

        String trimmedIdentifier = req.identifier().trim();
        if (!entity.getIdentifier().equalsIgnoreCase(trimmedIdentifier)
                && appConfigurationRepository.existsByIdentifier(trimmedIdentifier)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Configuration identifier already exists: " + trimmedIdentifier);
        }

        entity.setIdentifier(trimmedIdentifier);
        entity.setConfig(serializeConfig(req.config()));
        if (req.disabled() != null) {
            entity.setDisabled(req.disabled());
        }

        return toResponse(appConfigurationRepository.save(entity));
    }

    // Toggles the disabled status of a configuration
    public AppConfigurationResponse toggleConfigurationDisabled(Long id) {
        AppConfiguration entity = appConfigurationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Configuration not found for id: " + id));

        entity.setDisabled(!entity.isDisabled());
        return toResponse(appConfigurationRepository.save(entity));
    }

    // Soft-deletes a configuration by setting disabled = true
    public void deleteConfiguration(Long id) {
        AppConfiguration entity = appConfigurationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Configuration not found for id: " + id));
        entity.setDisabled(true);
        appConfigurationRepository.save(entity);
    }

    private AppConfigurationResponse toResponse(AppConfiguration entity) {
        JsonNode jsonNode;
        try {
            jsonNode = objectMapper.readTree(entity.getConfig());
        } catch (JacksonException e) {
            jsonNode = objectMapper.stringNode(entity.getConfig());
        }
        return new AppConfigurationResponse(
                entity.getId(),
                entity.getIdentifier(),
                jsonNode,
                entity.isDisabled()
        );
    }

    private String serializeConfig(Object rawConfig) {
        if (rawConfig == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Config cannot be null");
        }
        try {
            if (rawConfig instanceof String str) {
                // Validate that it is valid JSON
                objectMapper.readTree(str);
                return str;
            } else {
                return objectMapper.writeValueAsString(rawConfig);
            }
        } catch (JacksonException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid JSON content in config: " + e.getMessage());
        }
    }
}
