package com.example.metamorph.app.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.metamorph.common.entity.User;
import com.example.metamorph.common.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class CustomUserDetailsService implements UserDetailsService{
    private final UserRepository userRepository;

    @Override 
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException{
        User user = userRepository.findByEmail(email)
                    .orElseThrow(() ->  new UsernameNotFoundException("User not found"));

        return org.springframework.security.core.userdetails.User
               .withUsername(user.getEmail())
               .password(user.getPasswordHash())
               .roles(user.getRole().name())
               .build();
    }
}
