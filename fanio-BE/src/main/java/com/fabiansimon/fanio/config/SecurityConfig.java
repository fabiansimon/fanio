package com.fabiansimon.fanio.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Define a bean for the SecurityFilterChain
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // Configure HttpSecurity as required
        http
                .authorizeRequests(authz -> authz
                        .antMatchers("/api/**").permitAll()  // Allow public access to specific paths
                        .anyRequest().authenticated()  // Require authentication for any other request
                )
                .oauth2Login(oauth -> oauth
                                .loginPage("/login")  // Custom login page if required
                        // Further configuration for oauth if necessary
                )
                .logout(logout -> logout
                        .logoutSuccessUrl("/")  // Redirect to the home page on logout
                );

        // Return the built HttpSecurity instance
        return http.build();
    }
}
