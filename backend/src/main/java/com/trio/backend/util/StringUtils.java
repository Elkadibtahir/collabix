package com.trio.backend.util;

/**
 * Classe utilitaire pour les opérations sur les chaînes
 * de caractères.
 */
public final class StringUtils {

    private StringUtils() {
        throw new IllegalStateException("Utility class");
    }

    /**
     * Normalise une adresse email.
     *
     * - suppression des espaces
     * - conversion en minuscules
     */
    public static String normalizeEmail(String email) {

        if (email == null) {
            return null;
        }

        return email.trim().toLowerCase();
    }

}