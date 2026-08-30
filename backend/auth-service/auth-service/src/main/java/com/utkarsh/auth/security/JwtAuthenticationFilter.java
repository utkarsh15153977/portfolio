package com.utkarsh.auth.security;

import com.utkarsh.auth.entity.User;
import com.utkarsh.auth.service.TokenRevocationService;
import com.utkarsh.auth.service.UserCacheService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final TokenRevocationService tokenRevocationService;
    private final UserCacheService userCacheService;

    public JwtAuthenticationFilter(JwtService jwtService,
                                   TokenRevocationService tokenRevocationService,
                                   UserCacheService userCacheService) {
        this.jwtService = jwtService;
        this.tokenRevocationService = tokenRevocationService;
        this.userCacheService = userCacheService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            // 1. Check if token is revoked (Redis, fail-open)
            if (tokenRevocationService.isRevoked(token)) {
                filterChain.doFilter(request, response);
                return;
            }

            // 2. Validate JWT signature + expiration
            if (!jwtService.isTokenValid(token)) {
                filterChain.doFilter(request, response);
                return;
            }

            // 3. Extract email
            String email = jwtService.extractEmail(token);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // 4. Load user (PostgreSQL via cache service, fail-open)
                Optional<User> userOpt = userCacheService.findUserByEmail(email);
                if (userOpt.isPresent()) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userOpt.get(), null, new ArrayList<>());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception ignored) {
        }

        filterChain.doFilter(request, response);
    }
}
