package com.trio.backend.dto.Knowledgebase;

import com.trio.backend.entity.KnowledgeBase.KnowledgeBaseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating an existing Knowledge Lowe article.
 *
 * <p>Supports content updates and metadata changes for article lifecycle management.</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateKnowledgeBaseRequest {

    /**
     * The title of the knowledge lowe article.
     * Optional for partial updates.
     */
    private String title;

    /**
     * The content of the knowledge lowe article.
     * Optional for partial updates.
     */
    private String content;

    /**
     * Brief summary or excerpt of the article.
     * Optional for partial updates.
     */
    private String summary;

    /**
     * The category of this knowledge lowe article.
     * Optional for partial updates.
     */
    private String category;

    /**
     * Comma-separated tags for article classification.
     * Optional for partial updates.
     */
    private String tags;

    /**
     * The new status of the knowledge lowe article.
     * Can be ACTIVE, ARCHIVED, or DELETED for lifecycle management.
     */
    private KnowledgeBaseStatus status;

    /**
     * Flag indicating whether this article is pinned/featured.
     * Optional for pinning/unpinning articles.
     */
    private Boolean isPinned;

    /**
     * Flag indicating whether the article content has been processed by AI.
     * Optional for tracking AI processing state.
     */
    private Boolean aiProcessed;

    /**
     * Flag indicating whether RAG embeddings are available.
     * Optional for tracking RAG/Vector Search availability.
     */
    private Boolean ragEmbeddingsAvailable;
}
