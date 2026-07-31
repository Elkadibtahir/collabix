package com.trio.backend.security.jwt;

import com.trio.backend.entity.User;
import com.trio.backend.entity.UserRole;
import com.trio.backend.enums.MemberType;
import com.trio.backend.enums.TokenType;
import com.trio.backend.enums.RoleName;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.UUID;

/**
 * Service responsable de la génération, du parsing et de la validation
 * des tokens JWT (access & refresh).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class JwtService {

    private static final String CLAIM_UID = "uid";
    private static final String CLAIM_MEMBER_TYPE = "memberType";
    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_TYPE = "type";
    private static final String CLAIM_PERMISSIONS = "permissions";

    private final JwtProperties jwtProperties;

    // ------------------------------------------------------------------
    // Génération des tokens
    // ------------------------------------------------------------------

    /**
     * Génère un Access Token pour l'utilisateur donné.
     * Contient l'id utilisateur, son type de membre et ses rôles.
     */
    public String generateAccessToken(User user) {

        Map<String, Object> claims = new HashMap<>();
        claims.put(CLAIM_UID, user.getId().toString());
        claims.put(CLAIM_MEMBER_TYPE, user.getMemberType().name());
        claims.put(CLAIM_ROLE, extractRoleNames(user));
        claims.put(CLAIM_TYPE, TokenType.ACCESS.name());
        claims.put(CLAIM_PERMISSIONS, extractPermissionCodes(user));

        return buildToken(claims, user.getEmail(), jwtProperties.getAccessTokenExpiration());
    }

    private List<String> extractRoleNames(User user) {
        return user.getUserRoles()
                .stream()
                .map(ur -> ur.getRole().getName().name())
                .sorted()
                .distinct()
                .toList();
    }

    /**
     * Extracts all permission codes from the user's roles.
     */
    private List<String> extractPermissionCodes(User user) {
        return user.getUserRoles().stream()
                .flatMap(ur -> ur.getRole().getRolePermissions().stream())
                .map(rp -> rp.getPermission().getCode())
                .distinct()
                .sorted()
                .toList();
    }

    /**
     * Génère un Refresh Token pour l'utilisateur donné.
     * Ne contient que l'id utilisateur, volontairement minimal.
     */
    public String generateRefreshToken(User user) {

        Map<String, Object> claims = new HashMap<>();
        claims.put(CLAIM_UID, user.getId().toString());
        claims.put(CLAIM_TYPE, TokenType.REFRESH.name());

        return buildToken(claims, user.getEmail(), jwtProperties.getRefreshTokenExpiration());
    }

    /**
     * Construit un JWT signé avec les claims, le sujet, l'issuer,
     * un identifiant unique (jti) et une date d'expiration.
     */
    private String buildToken(Map<String, Object> claims, String subject, long expiration) {

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuer(jwtProperties.getIssuer())
                .id(UUID.randomUUID().toString())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    private SecretKey getSigningKey() {
        String secret = jwtProperties.getSecret();
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "JWT secret is not configured. Set app.jwt.secret in application.properties " +
                    "or the JWT_SECRET environment variable. The secret must be at least 256 bits (32 bytes) long."
            );
        }

        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);

        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "JWT secret is too short: " + keyBytes.length + " bytes (min 32). " +
                    "The secret must be at least 256 bits (32 bytes) long for HS256."
            );
        }

        return Keys.hmacShaKeyFor(keyBytes);
    }

    // ------------------------------------------------------------------
    // Extraction des claims
    // ------------------------------------------------------------------

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public UUID extractUserId(String token) {
        String id = extractAllClaims(token).get(CLAIM_UID, String.class);
        return UUID.fromString(id);
    }

    public RoleName extractRole(String token) {
        List<String> roles = extractRoles(token);
        if (roles.isEmpty()) return null;
        return RoleName.valueOf(roles.getFirst());
    }

    public List<String> extractRoles(String token) {
        @SuppressWarnings("unchecked")
        List<String> roles = extractAllClaims(token).get(CLAIM_ROLE, List.class);
        return roles != null ? roles : List.of();
    }

    public MemberType extractMemberType(String token) {
        String memberType = extractAllClaims(token).get(CLAIM_MEMBER_TYPE, String.class);
        return memberType != null ? MemberType.valueOf(memberType) : null;
    }

    @SuppressWarnings("unchecked")
    public List<String> extractPermissions(String token) {
        List<String> permissions = extractAllClaims(token).get(CLAIM_PERMISSIONS, List.class);
        return permissions != null ? permissions : List.of();
    }

    public TokenType extractTokenType(String token) {
        String type = extractAllClaims(token).get(CLAIM_TYPE, String.class);
        return type != null ? TokenType.valueOf(type) : null;
    }

    public String extractJti(String token) {
        return extractAllClaims(token).getId();
    }

    public String extractIssuer(String token) {
        return extractAllClaims(token).getIssuer();
    }

    public Date extractExpiration(String token) {
        return extractAllClaims(token).getExpiration();
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .clockSkewSeconds(60)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // ------------------------------------------------------------------
    // Validation
    // ------------------------------------------------------------------

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Vérifie qu'un token est valide : signature correcte, non expiré
     * et émis par l'issuer attendu.
     */
    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);

            boolean issuerMatches = jwtProperties.getIssuer().equals(claims.getIssuer());
            boolean notExpired = !claims.getExpiration().before(new Date());

            return issuerMatches && notExpired;

        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Vérifie qu'un token est valide et correspond au type attendu
     * (ACCESS ou REFRESH). Utile pour empêcher qu'un refresh token
     * soit utilisé comme access token, et inversement.
     */
    public boolean isTokenValid(String token, TokenType expectedType) {
        return isTokenValid(token) && expectedType == extractTokenType(token);
    }

    // ------------------------------------------------------------------
    // Helpers internes
    // ------------------------------------------------------------------

}