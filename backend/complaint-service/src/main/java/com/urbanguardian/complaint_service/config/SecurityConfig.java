package com.urbanguardian.complaint_service.config;

import java.io.IOException;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

        private void writeError(
                        HttpServletResponse response,
                        int status,
                        String message) throws IOException {

                response.setStatus(status);
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write(
                                "{\"error\":\"" + message + "\"}");
        }

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http) throws Exception {

                http
                                .csrf(csrf -> csrf.disable())
                                .authorizeHttpRequests(auth -> auth

                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/complaints")
                                                .permitAll()

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/complaints/track/*")
                                                .permitAll()
                                                // Allow citizens to view complaint evidence
                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/complaints/*/photo/*")
                                                .permitAll()

                                                // Keep photo uploads protected
                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/complaints/*/photo")
                                                .permitAll()
                                                .requestMatchers("/api/complaints/**")
                                                .hasRole("ADMIN")

                                                .anyRequest().permitAll())
                                .httpBasic(Customizer.withDefaults())
                                .exceptionHandling(exceptions -> exceptions

                                                .authenticationEntryPoint(
                                                                (request, response, exception) -> writeError(
                                                                                response,
                                                                                401,
                                                                                "Administrator login required"))

                                                .accessDeniedHandler(
                                                                (request, response, exception) -> writeError(
                                                                                response,
                                                                                403,
                                                                                "Access denied")));

                return http.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public UserDetailsService userDetailsService(
                        PasswordEncoder encoder) {

                String password = System.getenv("URBANGUARDIAN_ADMIN_PASSWORD");

                if (password == null || password.isBlank()) {
                        throw new IllegalStateException(
                                        "Set URBANGUARDIAN_ADMIN_PASSWORD before starting complaint-service");
                }

                return new InMemoryUserDetailsManager(
                                User.withUsername("admin")
                                                .password(encoder.encode(password))
                                                .roles("ADMIN")
                                                .build());
        }
}
