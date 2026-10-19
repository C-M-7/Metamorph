package com.example.metamorph.app.controller;

import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.metamorph.app.dto.AuthRequest;
import com.example.metamorph.app.dto.AuthResponse;
import com.example.metamorph.app.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;

@RestController 
@RequestMapping("/api/auth")
@RequiredArgsConstructor 
public class AuthController {
    private final AuthService authService;

    @Value ("${app.cookie-secure}")
    private boolean cookieSecure;

    @Value ("${jwt.refresh-expiry-ms}")
    private long refreshExpiryMs;

    // Registers a new user account with validated credentials
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody AuthRequest req){
        authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Registered"));
    }

    // Authenticates user and returns an access token in the body with a refresh cookie
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest req){
        var tokens = authService.login(req);
        return withRefreshCookie(tokens);
    }

    // Generates a new token pair using the refresh token from the HTTP-only cookie
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@CookieValue(name = "refreshToken", required = false) String refreshToken){
        var tokens = authService.refresh(refreshToken);
        return withRefreshCookie(tokens);
    }

    // Logs out the user and clears the refresh token cookie from the client
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        authService.logout(refreshToken);
        // Overwrite cookie with empty value and 0 max age to expire it immediately
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, buildCookie("", 0).toString())
                .build();
    }

    // Attaches the refresh token as an HTTP-only cookie while returning the access token in the response body
    private ResponseEntity<AuthResponse> withRefreshCookie(AuthService.TokenPair tokens){
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildCookie(tokens.refreshToken(), refreshExpiryMs/1000).toString())
                .body(new AuthResponse(tokens.accessToken()));
    }

    // Builds a secure HTTP-only cookie scoped strictly to the authentication endpoints
    private ResponseCookie buildCookie(String value, long maxAgeSeconds){
        return ResponseCookie.from("refreshToken", value)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/api/auth")
                .maxAge(maxAgeSeconds)
                .build();
    }

}
