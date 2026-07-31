package com.trio.backend.dto.Dashboard.scope.widget;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * Widget representant un article de lowe de connaissances dans le
 * Personal Dashboard (section Workspace Feed).
 *
 * <p>Contient les information essentialles de l'article affichÃ©
 * dans le flow of activity of the workspace.</p>
 */
@Getter
@Setter
public class PersonalKnowledgeArticleWidget {

    /**
     * Identifiant de l'article.
     */
    private UUID id;

    /**
     * Titre de l'article.
     */
    private String title;

    /**
     * Category of the article.
     */
    private String category;

    /**
     * Creation date of the article.
     */
    private Instant createdAt;
}

