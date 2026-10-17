package com.example.metamorph.app.security;

import java.io.IOException;

import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

// Intercepts every incoming HTTP request once to authenticate JWT tokens
@Component 
@RequiredArgsConstructor 
public class JwtAuthFilter extends OncePerRequestFilter{
    private final JwtService jwtService;

    @Override 
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException
    { 
        // Retrieve the Authorization header from the incoming request
        String header = request.getHeader("Authorization");

        // Verify the header is present and starts with Bearer prefix
        if(header != null && header.startsWith("Bearer ")){
            try{
                // Parse and validate the token payload (removing "Bearer " prefix)
                Claims claims = jwtService.parseAccessToken(header.substring(7));
                String role = claims.get("role", String.class);
                var authorities = role != null 
                    ? List.of(new SimpleGrantedAuthority("ROLE_" + role))
                    : List.<SimpleGrantedAuthority>of();

                // Build authentication object with user email and role authorities
                var auth = new UsernamePasswordAuthenticationToken(
                    claims.get("email", String.class),
                    null,
                    authorities);

                // Set authentication in the security context for downstream authorization
                SecurityContextHolder.getContext().setAuthentication(auth);    
            }catch(JwtException | IllegalArgumentException e){
                // Invalid or expired token: request proceeds unauthenticated
            }
        }

        // Continue with the remaining filter chain
        chain.doFilter(request, response);
    }
}
