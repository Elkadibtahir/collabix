package com.trio.backend.security.jwt;

import com.trio.backend.entity.Permission;
import com.trio.backend.entity.Role;
import com.trio.backend.entity.RolePermission;
import com.trio.backend.entity.User;
import com.trio.backend.entity.UserRole;
import com.trio.backend.entity.ids.RolePermissionId;
import com.trio.backend.entity.ids.UserRoleId;
import com.trio.backend.enums.MemberType;
import com.trio.backend.enums.RoleName;
import com.trio.backend.enums.TokenType;
import com.trio.backend.enums.UserStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    private static final String VALID_SECRET = "my-32-character-ultra-secure-secret-key-for-tests!";
    private static final String SHORT_SECRET = "too-short";
    private static final String ISSUER = "collabix-test";
    private static final long ACCESS_EXPIRATION = 900000L;
    private static final long REFRESH_EXPIRATION = 604800000L;

    @Mock
    private JwtProperties jwtProperties;

    private JwtService jwtService;

    private User testUser;

    @BeforeEach
    void setUp() {
        lenient().when(jwtProperties.getSecret()).thenReturn(VALID_SECRET);
        lenient().when(jwtProperties.getIssuer()).thenReturn(ISSUER);
        lenient().when(jwtProperties.getAccessTokenExpiration()).thenReturn(ACCESS_EXPIRATION);
        lenient().when(jwtProperties.getRefreshTokenExpiration()).thenReturn(REFRESH_EXPIRATION);

        jwtService = new JwtService(jwtProperties);

        Permission permission = Permission.builder()
                .code("USER_READ")
                .displayName("Read Users")
                .build();

        RolePermission rolePermission = RolePermission.builder()
                .id(new RolePermissionId())
                .permission(permission)
                .build();

        Role role = Role.builder()
                .name(RoleName.ADMIN)
                .rolePermissions(Set.of(rolePermission))
                .build();

        UserRole userRole = UserRole.builder()
                .id(new UserRoleId())
                .role(role)
                .build();

        testUser = User.builder()
                .firstName("Test")
                .lastName("User")
                .email("test@collabix.app")
                .password("encoded-password")
                .memberType(MemberType.EMPLOYEE)
                .status(UserStatus.ACTIVE)
                .enabled(true)
                .userRoles(Set.of(userRole))
                .build();

        ReflectionTestUtils.setField(testUser, "id", UUID.fromString("00000000-0000-0000-0000-000000000001"));
    }

    @Test
    void generateAccessToken_shouldCreateValidToken() {
        String token = jwtService.generateAccessToken(testUser);

        assertNotNull(token);
        assertTrue(token.split("\\.").length == 3, "JWT should have 3 parts");

        assertEquals(testUser.getEmail(), jwtService.extractUsername(token));
        assertEquals(TokenType.ACCESS, jwtService.extractTokenType(token));
        assertEquals(ISSUER, jwtService.extractIssuer(token));
        assertEquals(testUser.getId(), jwtService.extractUserId(token));
    }

    @Test
    void generateRefreshToken_shouldCreateValidToken() {
        String token = jwtService.generateRefreshToken(testUser);

        assertNotNull(token);
        assertEquals(testUser.getEmail(), jwtService.extractUsername(token));
        assertEquals(TokenType.REFRESH, jwtService.extractTokenType(token));
        assertEquals(ISSUER, jwtService.extractIssuer(token));
        assertEquals(testUser.getId(), jwtService.extractUserId(token));
    }

    @Test
    void isTokenValid_shouldReturnTrueForValidAccessToken() {
        String token = jwtService.generateAccessToken(testUser);

        assertTrue(jwtService.isTokenValid(token));
        assertTrue(jwtService.isTokenValid(token, TokenType.ACCESS));
    }

    @Test
    void isTokenValid_shouldReturnFalseForWrongType() {
        String accessToken = jwtService.generateAccessToken(testUser);
        String refreshToken = jwtService.generateRefreshToken(testUser);

        assertFalse(jwtService.isTokenValid(accessToken, TokenType.REFRESH));
        assertFalse(jwtService.isTokenValid(refreshToken, TokenType.ACCESS));
    }

    @Test
    void isTokenExpired_shouldReturnFalseForFreshToken() {
        String token = jwtService.generateAccessToken(testUser);

        assertFalse(jwtService.isTokenExpired(token));
    }

    @Test
    void extractRoles_shouldReturnRoleNames() {
        String token = jwtService.generateAccessToken(testUser);

        var roles = jwtService.extractRoles(token);
        assertTrue(roles.contains(RoleName.ADMIN.name()));
    }

    @Test
    void extractPermissions_shouldReturnPermissionCodes() {
        String token = jwtService.generateAccessToken(testUser);

        var permissions = jwtService.extractPermissions(token);
        assertTrue(permissions.contains("USER_READ"));
    }

    @Test
    void extractMemberType_shouldReturnMemberType() {
        String token = jwtService.generateAccessToken(testUser);

        assertEquals(MemberType.EMPLOYEE, jwtService.extractMemberType(token));
    }

    @Test
    void extractJti_shouldReturnUniqueIds() {
        String token1 = jwtService.generateAccessToken(testUser);
        String token2 = jwtService.generateAccessToken(testUser);

        assertNotNull(jwtService.extractJti(token1));
        assertNotNull(jwtService.extractJti(token2));
        assertNotEquals(jwtService.extractJti(token1), jwtService.extractJti(token2));
    }

    @Test
    void getSigningKey_shouldThrowForShortSecret() {
        when(jwtProperties.getSecret()).thenReturn(SHORT_SECRET);
        jwtService = new JwtService(jwtProperties);

        assertThrows(IllegalStateException.class, () -> jwtService.generateAccessToken(testUser));
    }

    @Test
    void getSigningKey_shouldThrowForNullSecret() {
        when(jwtProperties.getSecret()).thenReturn(null);
        jwtService = new JwtService(jwtProperties);

        assertThrows(IllegalStateException.class, () -> jwtService.generateAccessToken(testUser));
    }

    @Test
    void getSigningKey_shouldThrowForBlankSecret() {
        when(jwtProperties.getSecret()).thenReturn("   ");
        jwtService = new JwtService(jwtProperties);

        assertThrows(IllegalStateException.class, () -> jwtService.generateAccessToken(testUser));
    }
}