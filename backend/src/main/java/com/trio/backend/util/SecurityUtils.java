package com.trio.backend.util;

import com.trio.backend.exception.BadRequestException;
import com.trio.backend.security.user.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

/**
 * Classe utilitaire pour accéder aux informations
 * de l'utilisateur actuellement authentifié.
 *
 * Cette classe centralise l'accès au SecurityContextHolder
 * afin d'éviter la duplication de code dans les services.
 */
public final class SecurityUtils {

    private SecurityUtils() {
        throw new IllegalStateException("Utility class");
    }

    /**
     * Retourne le principal actuellement authentifié.
     *
     * @return CustomUserDetails
     */
    public static CustomUserDetails getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof CustomUserDetails user)) {

            throw new BadRequestException("User is not authenticated.");
        }

        return user;
    }

    /**
     * Retourne l'identifiant de l'utilisateur connecté.
     */
    public static UUID getCurrentUserId() {
        return getCurrentUser().getId();
    }

    /**
     * Retourne l'email de l'utilisateur connecté.
     */
    public static String getCurrentUserEmail() {
        return getCurrentUser().getUsername();
    }

}