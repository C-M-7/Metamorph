package com.example.metamorph.app.security;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

// Configures application security, JWT authentication, and endpoint authorization rules
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    // Custom JWT filter to intercept and authenticate requests
    private final JwtAuthFilter jwtAuthFilter;

    // Allowed frontend client URL injected from application properties
    @Value("${app.client-url}") 
    private String clientUrl;

    // Configures the HTTP security filter chain and request access rules
    @Bean 
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
        http
            // Disable CSRF since the API uses stateless JWT authentication
            .csrf(csrf -> csrf.disable())
            // Enable CORS using the corsConfigurationSource bean defined below
            .cors(Customizer.withDefaults())
            // Use stateless session management so no HTTP session is stored on the server
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Define route access permissions: public auth routes, admin-only routes, and authenticated remainder
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            // Return 401 Unauthorized status on authentication failures
            .exceptionHandling(e -> e.authenticationEntryPoint(
                (req, res, ex) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized")))
            // Add custom JWT filter before the standard username/password filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // Provides BCrypt password encoder bean with work factor 12 for hashing passwords
    @Bean 
    PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder(12);
    }

    // Exposes the AuthenticationManager bean from AuthenticationConfiguration
    @Bean 
    AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception{
        return config.getAuthenticationManager();
    }

    // Configures CORS settings allowing frontend origin, HTTP methods, headers, and credentials
    @Bean 
    CorsConfigurationSource corsConfigurationSource(){
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of(clientUrl));
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        cfg.setAllowCredentials(true);   // required for cookies
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
