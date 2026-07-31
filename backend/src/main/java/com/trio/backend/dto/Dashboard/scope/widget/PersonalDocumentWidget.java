package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Widget representant un document recent de the authenticated user
 * dans le Personal Dashboard.
 */
@Getter
@Setter
public class PersonalDocumentWidget {

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
     * Type MIME du file.
     */
    private String mimeType;

    /**
     * Nom of the project associÃ©.
     */
    private String projectName;

    /**
     * Date de creation du document.
     */
    private Instant createdAt;
}

