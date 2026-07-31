package com.trio.backend.service;

import com.trio.backend.dto.auth.ChangePasswordRequest;
import com.trio.backend.dto.auth.LoginRequest;
import com.trio.backend.dto.auth.LoginResponse;
import com.trio.backend.dto.auth.RefreshTokenRequest;
import com.trio.backend.dto.auth.RefreshTokenResponse;
import com.trio.backend.dto.user.UserResponse;
import com.trio.backend.dto.auth.CompleteActivationRequest;
import com.trio.backend.dto.auth.ResetPasswordRequest;
import com.trio.backend.entity.ActivationToken;
import com.trio.backend.entity.User;
import com.trio.backend.enums.UserStatus;
import com.trio.backend.exception.BadRequestException;
import com.trio.backend.exception.ForbiddenException;
import com.trio.backend.repository.ActivationTokenRepository;
import com.trio.backend.repository.UserRepository;
import com.trio.backend.security.jwt.JwtProperties;
import com.trio.backend.security.jwt.JwtService;
import com.trio.backend.mapper.UserMapper;
import com.trio.backend.security.user.CustomUserDetails;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.config.AuthEventPublisher;
import com.trio.backend.config.LoginSecurityProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

/**
 * Implementation of the Collabix authentication service.
 *
 * This class centralizes all bfactoryss logic related to
 * authentication and management of connected users.
 *
 * Responsibilities:
 * - Authenticate a user with their email and password.
 * - Generate Access Tokens and Refresh Tokens JWT.
 * - Renew an Access Token from a valid Refresh Token.
 * - Revoke Refresh Tokens on logout.
 * - Resorteve the information of the currently authenticated user.
 *
 * This implementation collaborates with:
 * - AuthenticationManager for Spring Security authentication.
 * - JwtService for JWT generation and validation.
 * - RefreshTokenService for Refresh Token persistence and revocation.
 * - UserRepository and RoleRepository for data access.
 * - UserMapper for conversion between entities and DTOs.
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final String TOKEN_TYPE = "Bearer";

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final RefreshTokenService refreshTokenService;
    private final ActivationTokenRepository activationTokenRepository;
    private final PasswordResetService passwordResetService;
    private final LoginSecurityProperties loginSecurityProperties;
    private final AuthEventPublisher authEventPublisher;

    /**
     * Authentifie un user Ã  partir de son email et de son mot de passe.
     *
     * <p>ProtÃ¨ge les comptes contre les attaques par force brute en :</p>
     * <ul>
     *   <li>Rejectionant les comptes lockeds ({@code LOCKED}), suspendeds
     *       ({@code SUSPENDED}), inactives ({@code INACTIVE}) ou pending
     *       of activation ({@code PENDING_ACTIVATION}).</li>
     *   <li>Inc rÃ©mentant le compteur d'failures aprÃ¨s each tentative
     *       infructueuse.</li>
     *   <li>Verrouillant automaticment le compte lorsque the namebre maximal
     *       de tentatives est atteint.</li>
     * </ul>
     *
     * @param request les identifiants de connection (email, mot de passe)
     * @return the response containing the tokens et les information de the user
     * @throws ForbiddenException si le compte est locked, suspended, inactive
     *                            ou pending of activation
     * @throws BadCredentialsException si l'email ou le mot de passe est incorrect
     */
    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        // Step 1 â€” Find the user (before authentication, so we can check status)
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));

// Step 2 â€” Check if login security is enabled
        if (loginSecurityProperties.isEnabled()) {

            // Step 3 â€” Reject if account is locked
            if (user.getStatus() == UserStatus.LOCKED) {

                // Step 3a â€” Attempt automatic unlock if lock duration has expiressd
                if (canAutoUnlock(user)) {
                    autoUnlockAccount(user);
                    // Account is now ACTIVE; continuouse to authentication
                } else {
                    throw new ForbiddenException(
                            "Account is locked due to too many failed login attempts. Please try again later or contact an administrator."
                    );
                }
            }

            // Step 4 â€” Reject if account is suspended
            if (user.getStatus() == UserStatus.SUSPENDED) {
                throw new ForbiddenException("Account is suspended. Please contact an administrator.");
            }

            // Step 5 â€” Reject if account is inactive
            if (user.getStatus() == UserStatus.INACTIVE) {
                throw new ForbiddenException("Account is inactive. Please contact an administrator.");
            }

            // Step 6 â€” Reject if account is pending activation
            if (user.getStatus() == UserStatus.PENDING_ACTIVATION) {
                throw new ForbiddenException("Account is not activated. Please activate your account first.");
            }

            // Step 7 â€” Reject if account is archived
            if (user.getStatus() == UserStatus.ARCHIVED) {
                throw new ForbiddenException("Account is archived. Please contact an administrator.");
            }
        }

        // Step 8 â€” Attempt authentication
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            email,
                            request.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Step 8a â€” Success: reset login attempts, update lastLoginAt
            resetLoginAttempts(user);
            user.setLastLoginAt(Instant.now());
            userRepository.save(user);

            authEventPublisher.publishSuccessfulLogin(user);

            TokenPair tokens = generateAndPersistTokens(user);

            return LoginResponse.builder()
                    .accessToken(tokens.accessToken())
                    .refreshToken(tokens.refreshToken())
                    .tokenType(TOKEN_TYPE)
                    .expiresIn(jwtProperties.getAccessTokenExpiration())
                    .user(userMapper.toResponse(user))
                    .build();

        } catch (BadCredentialsException e) {

            // Step 8b â€” Failure: register failed login attempt
            if (loginSecurityProperties.isEnabled()) {
                registerFailedLoginAttempt(user);
            }

            // Re-throw a generic message to avoid leaking information
            throw new BadCredentialsException("Invalid email or password.");
        }
    }

/**
     * Renouvelle un Access Token Ã  partir d'un Refresh Token valid.
     *
     * <p>Delegates alle la logical mÃ©tier Ã  {@link RefreshTokenService#refreshAccessToken(String)}.
     * Le controleur ne contains aucune logical mÃ©tier.</p>
     *
     * @param request le Refresh Token Ã  utiliser pour le renewal
     * @return the response containing le nouveau couple de tokens
     * @throws BadRequestException si le Refresh Token est invalid
     */
    @Override
    @Transactional
    public RefreshTokenResponse refreshToken(RefreshTokenRequest request) {

        return refreshTokenService.refreshAccessToken(request.getRefreshToken());
    }

    /**
     * DÃ©connecte the user current.
     *
     * RÃ©voque le Refresh Token proemptyd et empty the context security,
     * invalidant ainsi la session currente.
     *
     * @param refreshToken le Refresh Token Ã  revoke
     */
@Override
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenService.revokeRefreshToken(refreshToken);
        SecurityContextHolder.clearContext();
    }

    /**
     * Resorteves the information de the currently authenticated.
     *
     * Rejectionte aussi les mains anonymes : avec Spring Security, un
     * AnonymousAuthenticationToken returns isAuthenticated() == true, donc
     * un simple test sur isAuthenticated() ne suffit pas. On verifies ici
     * directement que le main est bien un CustomUserDetails.
     *
     * @return les information de the user connected
     * @throws BadRequestException si aucun user authenticated n'est present
     * @throws ResourceNotFoundException si the user n'existe plus en lowe
     */
    @Override
    @Transactional(readOnly = true)
    public UserResponse me() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof CustomUserDetails main)) {
            throw new BadRequestException("User is not authenticated.");
        }

        User user = userRepository.findByEmail(main.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        return userMapper.toResponse(user);
    }

    /**
     * Generates une nouvelle paire access/refresh token for the user
     * donnÃ© et persiste le Refresh Token generated.
     *
     * @param user the user pour lequel generate the tokens
     * @return la paire de tokens generateds
     */
    private TokenPair generateAndPersistTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        com.trio.backend.entity.RefreshToken rt = refreshTokenService.createRefreshToken(user, null, null, null);
        return new TokenPair(accessToken, rt.getToken());
    }

    /**
     * Finalise l'activation d'un compte user.
     *
     * <p>Cette method implements le workflow complete of activation :</p>
     * <ol>
     *     <li>Valid que the token of activation existe en lowe de givens.</li>
     *     <li>Verifies que the token belong Ã  un user existant.</li>
     *     <li>Verifies que the token n'a pas expiresd.</li>
     *     <li>Verifies que the token n'a pas dÃ©jÃ  Ã©tÃ© used.</li>
     *     <li>Valid que le mot de passe et sa confirmation correspondssent.</li>
     *     <li>Encode le mot de passe avec {@link PasswordEncoder}.</li>
     *     <li>Active le compte : {@code enabled = true}, {@code status = ACTIVE}.</li>
     *     <li>Persiste le nouveau mot de passe.</li>
     *     <li>Marque the token comme used et saves the date of activation.</li>
     *     <li>All operations sont executed dans une seule transaction.</li>
     * </ol>
     *
     * @param request the request containing the token of activation, le mot de passe et sa confirmation
     * @throws BadRequestException si the token est invalid, expiresd, already in use,
     *                             ou si les mots de passe ne correspondssent pas
     */
    @Override
    @Transactional
    public void completeActivation(CompleteActivationRequest request) {

        // Step 1 â€” Validate that the activation token exists
        ActivationToken activationToken = activationTokenRepository
                .findByToken(request.getActivationToken())
                .orElseThrow(() -> new BadRequestException("Invalid activation token."));

        // Step 2 â€” Verify the token belong to an existing user
        User user = activationToken.getUser();
        if (user == null) {
            throw new BadRequestException("Activation token is not associated with any user.");
        }

        // Step 2 â€” Verify the token has not expiressd
        if (activationToken.getExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("Activation token has expiressd. Please request a new one.");
        }

        // Step 2 â€” Verify the token has not already been used
        if (activationToken.getStatus() == ActivationToken.Status.USED) {
            throw new BadRequestException("Activation token has already been used.");
        }

        // Step 3 â€” Validate password confirmation matches
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match.");
        }

        // Step 4 â€” Encode the password using the existing PasswordEncoder
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // Step 5 â€” Update the user: enabled = true, status = ACTIVE
        user.setEnabled(true);
        user.setStatus(UserStatus.ACTIVE);

        // Step 6 â€” Persist the encoded password
        user.setPassword(encodedPassword);

        // Step 7 â€” Mark the activation token as used
        activationToken.setStatus(ActivationToken.Status.USED);
        activationToken.setUsedAt(Instant.now());

        // Step 8 â€” Persist all modifications inside a single transaction
        // (already guaranteed by @Transactional)
        userRepository.save(user);
        activationTokenRepository.save(activationToken);
    }

/**
     * Initie une request de reset de mot de passe.
     *
     * <p>Delegates Ã  {@link PasswordResetService} pour alle la logical mÃ©tier.
     * La method Returns toudays une response generic pour ne pas rÃ©vÃ©ler
     * si l'email existe ou non dans le systÃ¨me.</p>
     *
     * @param email l'address email de the user demandant la reset
     */
    @Override
    public void requestPasswordReset(String email) {
        passwordResetService.requestPasswordReset(email);
    }

/**
     * Resets le mot de passe of a user Ã  partir d'un token valid.
     *
     * <p>Delegates Ã  {@link PasswordResetService} pour validate the token,
     * encode le nouveau mot de passe et le persister.</p>
     *
     * @param request the request containing the token de reset, le nouveau mot de passe et sa confirmation
     */
    @Override
    public void resetPassword(ResetPasswordRequest request) {
        passwordResetService.resetPassword(
                request.getResetToken(),
                request.getPassword(),
                request.getConfirmPassword()
        );
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof CustomUserDetails principal)) {
            throw new BadRequestException("User is not authenticated.");
        }

        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect.");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    /**
     * Regroupe un Access Token et un Refresh Token generateds ensemble.
     */
    private record TokenPair(String accessToken, String refreshToken) {}

    // ---------------------------------------------------------------
    // Login Security (Brute-Force Protection)
    // ---------------------------------------------------------------

    /**
     * Registers a failed login attempt for the given user.
     *
     * <p>Increments the {@code failedLoginAttempts} counter. If the counter
     * reaches the configured maximum, the account is locked:
     * {@code status = LOCKED}, {@code lockedAt = now()}, and all active
     * refresh tokens are revoked.</p>
     *
     * @param user the user whose login attempt failed
     */
    @Override
    @Transactional
    public void registerFailedLoginAttempt(User user) {

        int currentAttempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(currentAttempts);

        authEventPublisher.publishFailedLogin(user, currentAttempts, loginSecurityProperties.getMaxAttempts());

        if (currentAttempts >= loginSecurityProperties.getMaxAttempts()) {
            user.setStatus(UserStatus.LOCKED);
            user.setLockedAt(Instant.now());

            // Revoke all active refresh tokens to invalidate any existing sessions
            refreshTokenService.revokeAllUserTokens(user.getId());

            authEventPublisher.publishAccountLocked(user, currentAttempts);
        }

        userRepository.save(user);
    }

    /**
     * Resets the login attempt counter for the given user after a
     * successful login.
     *
     * <p>Sets {@code failedLoginAttempts = 0}, clears {@code lockedAt},
     * and updates {@code lastLoginAt}.</p>
     *
     * @param user the user who logged in successfully
     */
    @Override
    @Transactional
    public void resetLoginAttempts(User user) {
        user.setFailedLoginAttempts(0);
        user.setLockedAt(null);
        // lastLoginAt is set separately in the login method
    }

    /**
     * Unlocks a locked user account.
     *
     * <p>Resets {@code failedLoginAttempts} to 0, clears {@code lockedAt},
     * restores {@code status} to {@code ACTIVE}, and revokes all active
     * refresh tokens for the user.</p>
     *
     * @param userId the UUID of the user to unlock
     * @throws ResourceNotFoundException if no user exists with the given ID
     */
    @Override
    @Transactional
    public void unlockAccount(UUID userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        user.setFailedLoginAttempts(0);
        user.setLockedAt(null);
        user.setStatus(UserStatus.ACTIVE);

        // Revoke all active refresh tokens to invalidate any lingering sessions
        refreshTokenService.revokeAllUserTokens(user.getId());

        userRepository.save(user);

authEventPublisher.publishAccountUnlocked(user);
    }

    // ---------------------------------------------------------------
    // Automatic Account Unlock
    // ---------------------------------------------------------------

    /**
     * Checks whether the lock duration has expiressd and the account is
     * eligible for automatic unlocking.
     *
     * <p>An account is eligible for automatic unlocking when all of the
     * following conditions are met:</p>
     * <ul>
     *   <li>{@link LoginSecurityProperties#isAutomaticUnlockEnabled()} returns
     *       {@code true}</li>
     *   <li>The user's status is {@code LOCKED}</li>
     *   <li>{@code lockedAt} is not null</li>
     *   <li>The elapsed time since {@code lockedAt} is greater than or equal
     *       to the configured {@link LoginSecurityProperties#getLockDuration()}</li>
     * </ul>
     *
     * @param user the user to check
     * @return {@code true} if the account can be automatically unlocked
     */
    @Override
    public boolean canAutoUnlock(User user) {

        if (!loginSecurityProperties.isAutomaticUnlockEnabled()) {
            return false;
        }

        if (user.getStatus() != UserStatus.LOCKED) {
            return false;
        }

        if (user.getLockedAt() == null) {
            return false;
        }

        Duration elapsed = Duration.between(user.getLockedAt(), Instant.now());
        return elapsed.compareTo(loginSecurityProperties.getLockDuration()) >= 0;
    }

    /**
     * Automatically unlocks a locked user account.
     *
     * <p>Resets {@code failedLoginAttempts} to 0, clears {@code lockedAt},
     * and restores {@code status} to {@code ACTIVE}. Unlike the manual
     * unlock, this method does <strong>not</strong> revoke refresh tokens,
     * because the user is actively authenticating and will receive a fresh
     * token pair upon successful login.</p>
     *
     * @param user the user to unlock (must be managed by the persistence context)
     */
    @Override
    @Transactional
    public void autoUnlockAccount(User user) {
        user.setFailedLoginAttempts(0);
        user.setLockedAt(null);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
    }

}
