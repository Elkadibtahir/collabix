package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Widget representant une attachment in a project
 * pour le Project Dashboard.
 */
@Getter
@Setter
public class ProjectAttachmentWidget {

    /**
     * ID of the attachment.
     */
    private UUID id;

    /**
     * Nom du file.
     */
    private String fileName;

    /**
     * Type MIME du file.
     */
    private String mimeType;

    /**
     * Taille du file en octets.
     */
    private Long fileSize;

    /**
     * Date de creation.
     */
    private Instant createdAt;
}
