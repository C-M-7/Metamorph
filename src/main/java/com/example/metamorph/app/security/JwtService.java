package com.example.metamorph.app.security;

import java.util.Date;
import java.util.HexFormat;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.metamorph.common.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service 
public class JwtService {
    private final SecretKey accessKey;
    private final SecretKey refreshKey;
    private final long accessExpiryMs;
    private final long refreshExpiryMs;

    // Initializes HMAC signing keys from base64 secrets and sets expiration times
    public JwtService(
        @Value("${jwt.access-secret}") String accessSecret,
        @Value("${jwt.refresh-secret}") String refreshSecret,
        @Value("${jwt.access-expiry-ms}") long accessExpiryMs,
        @Value("${jwt.refresh-expiry-ms}") long refreshExpiryMs
    ) {
        this.accessKey = Keys.hmacShaKeyFor(Base64.getDecoder().decode(accessSecret));
        this.refreshKey = Keys.hmacShaKeyFor(Base64.getDecoder().decode(refreshSecret));
        this.accessExpiryMs = accessExpiryMs;
        this.refreshExpiryMs = refreshExpiryMs;
    }

    // Generates a signed refresh token containing user ID, token family, and unique token ID (jti)
    public String generateRefreshToken(User user, String family){
        Date now = new Date();

        return Jwts.builder()
                   .subject(String.valueOf(user.getId()))
                   .claim("family", family)
                   .id(UUID.randomUUID().toString())
                   .issuedAt(now)
                   .expiration(new Date(now.getTime() + refreshExpiryMs))
                   .signWith(refreshKey)
                   .compact();
    }

    // Generates a signed short-lived access token containing user ID, email, and role
    public String generateAccessToken(User user) {
        Date now = new Date();
        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(now)
                .expiration(new Date(now.getTime() + accessExpiryMs))
                .signWith(accessKey)
                .compact();
    }

    // Validates the signature and extracts claims from an access token
    public Claims parseAccessToken(String token){
        return Jwts.parser().verifyWith(accessKey).build()
               .parseSignedClaims(token).getPayload();
    }

    // Validates the signature and extracts claims from a refresh token
    public Claims parseRefreshToken(String token) {
        return Jwts.parser().verifyWith(refreshKey).build()
                .parseSignedClaims(token).getPayload();
    }

    // Returns the configured refresh token validity duration in milliseconds
    public long getRefreshExpiryMs() {return refreshExpiryMs;}

    // Computes a SHA-256 hex digest of a token for secure database storage
    public static String hash(String token){
        try{
            byte[] digest = MessageDigest.getInstance("SHA-256")
                            .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        }catch(NoSuchAlgorithmException e){
            throw new IllegalStateException(e);
        }
    }
}
