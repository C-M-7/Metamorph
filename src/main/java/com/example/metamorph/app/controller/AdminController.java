package com.example.metamorph.app.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.metamorph.app.dto.AppConfigurationRequest;
import com.example.metamorph.app.dto.AppConfigurationResponse;
import com.example.metamorph.app.dto.UserResponse;
import com.example.metamorph.app.service.AdminService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController 
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // GET /api/admin/users?page=0&size=15
    @GetMapping("/users")
    public ResponseEntity<Page<UserResponse>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        return ResponseEntity.ok(adminService.getUsers(page, size));
    }

    // POST /api/admin/configurations - Create new config
    @PostMapping("/configurations")
    public ResponseEntity<AppConfigurationResponse> createConfiguration(
            @Valid @RequestBody AppConfigurationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createConfiguration(request));
    }

    // GET /api/admin/configurations?page=0&size=15 - Read all configs paginated
    @GetMapping("/configurations")
    public ResponseEntity<Page<AppConfigurationResponse>> getConfigurations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        return ResponseEntity.ok(adminService.getConfigurations(page, size));
    }

    // GET /api/admin/configurations/{id} - Read single config by id
    @GetMapping("/configurations/{id}")
    public ResponseEntity<AppConfigurationResponse> getConfigurationById(
            @PathVariable Long id) {
        return ResponseEntity.ok(adminService.getConfigurationById(id));
    }

    // PUT /api/admin/configurations/{id} - Update config by id
    @PutMapping("/configurations/{id}")
    public ResponseEntity<AppConfigurationResponse> updateConfiguration(
            @PathVariable Long id,
            @Valid @RequestBody AppConfigurationRequest request) {
        return ResponseEntity.ok(adminService.updateConfiguration(id, request));
    }

    // PATCH /api/admin/configurations/{id}/toggle - Toggle disabled flag
    @PatchMapping("/configurations/{id}/toggle")
    public ResponseEntity<AppConfigurationResponse> toggleConfigurationDisabled(
            @PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleConfigurationDisabled(id));
    }

    // DELETE /api/admin/configurations/{id} - Delete configuration
    @DeleteMapping("/configurations/{id}")
    public ResponseEntity<Void> deleteConfiguration(
            @PathVariable Long id) {
        adminService.deleteConfiguration(id);
        return ResponseEntity.noContent().build();
    }
}
