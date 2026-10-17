package com.example.metamorph.app.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.metamorph.app.dto.AuthRequest;
import com.example.metamorph.app.security.JwtService;
import com.example.metamorph.common.entity.RefreshToken;
import com.example.metamorph.common.entity.User;
import com.example.metamorph.common.repository.RefreshTokenRepository;
import com.example.metamorph.common.repository.UserRepository;

import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class AuthService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public record TokenPair(String accessToken, String refreshToken) {}

    // Registers a new user with a hashed password after ensuring the email is unique
    public void register(AuthRequest req){
        if (userRepository.existsByEmail(req.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        User user = new User();
        // Normalize email to lowercase to prevent case-sensitive duplicate accounts
        user.setEmail(req.email().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        userRepository.save(user);
    }

    // Authenticates user credentials and issues a fresh token pair under a new token family
    @Transactional 
    public TokenPair login(AuthRequest req){
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email().toLowerCase(), req.password()));
        } catch (AuthenticationException e) {
            // Same message for wrong email or wrong password
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        User user = userRepository.findByEmail(req.email().toLowerCase()).orElseThrow();
        String family = UUID.randomUUID().toString();   // new login = new family
        return issueTokens(user, family);
    }

    // Revokes the token family associated with the refresh token to end the session
    @Transactional 
    public void logout(String token){
        if(token == null) return;

        // Hash the incoming token and revoke the entire family so this session cannot be refreshed
        refreshTokenRepository.findByTokenHash(JwtService.hash(token))
            .ifPresent(t -> refreshTokenRepository.revokeFamily(t.getFamily()));
    }

    // Rotates the refresh token, detects token reuse, and issues a new token pair
    // Do not roll back on exception so that family revocation is committed if token reuse is detected
    @Transactional(noRollbackFor = ResponseStatusException.class) 
    public TokenPair refresh(String oldToken){
        if(oldToken == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No refresh token found!!");
        }

        try{
            // Verify JWT structure, signature, and expiration before hitting the database
            jwtService.parseRefreshToken(oldToken);
        }catch(JwtException | IllegalArgumentException e){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Refresh Token!");
        }

        RefreshToken stored = refreshTokenRepository.findByTokenHash(JwtService.hash(oldToken))
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unknown refresh token"));

        // If a previously revoked token is reused, assume theft and invalidate the entire family
        if(stored.isRevoked()){
            refreshTokenRepository.revokeFamily(stored.getFamily());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token reuse detected. Please log in again");   
        }

        // Single-use token rotation: invalidate the used token before issuing a new pair
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        return issueTokens(stored.getUser(), stored.getFamily());
    }

    // Generates, stores, and returns a new access and refresh token pair for a token family
    private TokenPair issueTokens(User user, String family){
        String access = jwtService.generateAccessToken(user);
        String refresh = jwtService.generateRefreshToken(user, family);

        RefreshToken entity = new RefreshToken();
        entity.setUser(user);
        // Store only the token hash to safeguard refresh tokens against database breaches
        entity.setTokenHash(JwtService.hash(refresh));
        entity.setFamily(family);
        entity.setExpiresAt(Instant.now().plusMillis(jwtService.getRefreshExpiryMs()));
        refreshTokenRepository.save(entity);

        return new TokenPair(access, refresh);
    }
}
