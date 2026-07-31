package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

/**
 * Widget representant une activity recent dans le Dashboard.
 *
 * <p>Provient des modules Activity, Comment ou all other module
 * produisant des events visible by the user.</p>
 */
@Getter
@Setter
public class RecentActivityWidget {

    /**
     * Type de l'activity (ex: "ACTIVITY", "COMMENT").
     */
    private String type;

    /**
     * Textual description of the activity.
     */
    private String description;

    /**
     * Nom complete de l'acteur Ã  l'origine de l'activity.
     */
    private String actorName;

    /**
     * Timestamp of the activity au format ISO-8601.
     */
    private String timestamp;
}

