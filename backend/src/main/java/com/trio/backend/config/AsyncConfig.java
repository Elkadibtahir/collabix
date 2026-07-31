package com.trio.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Configuration pour l'exécution asynchrone des tâches.
 *
 * <p>Active le support de {@link org.springframework.scheduling.annotation.Async @Async}
 * dans l'ensemble de l'application, permettant l'envoi d'emails et autres
 * opérations non bloquantes sans impacter le thread principal.</p>
 */
@Configuration
@EnableAsync
public class AsyncConfig {
}

