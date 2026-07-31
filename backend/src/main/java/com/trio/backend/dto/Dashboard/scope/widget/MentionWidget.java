package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Widget representant une mention non lue de the user
 * dans le Personal Dashboard.
 */
@Getter
@Setter
public class MentionWidget {

    /**
     * Identifiant de la mention.
     */
    private UUID id;

    /**
     * Nom de l'acteur ayant mentionnÃ© the user.
     */
    private String actorName;

    /**
     * Contexte de la mention (ex: title de the task).
     */
    private String context;

    /**
     * Horodatage de la mention.
     */
    private Instant createdAt;
}

