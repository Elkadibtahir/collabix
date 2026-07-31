package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Widget representant un comment recent in a project
 * pour le Project Dashboard.
 */
@Getter
@Setter
public class ProjectCommentWidget {

    /**
     * Identifiant du comment.
     */
    private UUID id;

    /**
     * Content du comment.
     */
    private String content;

    /**
     * Nom de l'author du comment.
     */
    private String authorName;

    /**
     * Horodatage du comment.
     */
    private Instant createdAt;
}
