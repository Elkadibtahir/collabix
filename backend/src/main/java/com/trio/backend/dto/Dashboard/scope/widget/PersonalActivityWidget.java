package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Widget representant une activity recent impliquant the user
 * authenticated dans le Personal Dashboard.
 */
@Getter
@Setter
public class PersonalActivityWidget {

    /**
     * ID of the activity.
     */
    private UUID id;

    /**
     * Textual description of the activity.
     */
    private String description;

    /**
     * Nom of the project dans lequel l'activity a eu lieu.
     */
    private String projectName;

    /**
     * Timestamp of the activity.
     */
    private Instant createdAt;
}

