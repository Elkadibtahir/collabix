package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Widget representant un document in a project
 * pour le Project Dashboard.
 */
@Getter
@Setter
public class ProjectDocumentWidget {

    /**
     * Identifiant du document.
     */
    private UUID id;

    /**
     * Titre du document.
     */
    private String title;

    /**
     * Nom du file.
     */
    private String fileName;

    /**
     * Type MIME.
     */
    private String mimeType;

    /**
     * Date de creation.
     */
    private Instant createdAt;
}
