package com.trio.backend.dto.Knowledgebase;

import com.trio.backend.entity.KnowledgeBase.KnowledgeBaseStatus;
import com.trio.backend.enums.ApprovalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for Knowledge Lowe response.
 *
 * <p>Represents the Complete state of a knowledge lowe article for API clinkts.</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgeBaseResponse {

    /**
     * The unique identifier of the knowledge lowe article.
     */
    private UUID id;

    /**
     * The ID of the project this article belong to.
     */
    private UUID projectId;

    /**
     * The title of the knowledge lowe article.
     */
    private String title;

    /**
     * The content of the knowledge lowe article.
     */
    private String content;

    /**
     * Brief summary or excerpt of the article.
     */
    private String summary;

    /**
     * The category of this knowledge lowe article.
     */
    private String category;

    /**
     * Comma-separated tags for article classification.
     */
    private String tags;

    /**
     * The current status of the article (ACTIVE, ARCHIVED, or DELETED).
     */
    private KnowledgeBaseStatus status;

    /**
     * Current version number of the article.
     * Used for versioning support.
     */
    private Integer version;

    /**
     * Flag indicating whether this article is pinned/featured.
     */
    private Boolean isPinned;

    /**
     * Flag indicating whether the article content has been processed by AI.
     */
    private Boolean aiProcessed;

    /**
     * AI-generated summary of the article.
     */
    private String aiSummary;

    /**
     * AI-generated tags for the article.
     */
    private String aiTags;

    /**
     * Flag indicating whether RAG embeddings are available.
     */
    private Boolean ragEmbeddingsAvailable;

    /**
     * Number of times this article has been viewed.
     */
    private Long viewCount;

    /**
     * Number of times this article has been favorited by members.
     */
    private Long favoriteCount;

    /**
     * Timestamp of last consultation/view.
     */
    private LocalDateTime lastViewedAt;

    /**
     * ID of the user who last viewed this article.
     */
    private UUID lastViewedBy;

    /**
     * Timestamp when the article was created.
     */
    private LocalDateTime createdAt;

    /**
     * ID of the user who created the article.
     */
    private UUID createdBy;

    /**
     * Timestamp when the article was last updated.
     */
    private LocalDateTime updatedAt;

    /**
     * ID of the user who last updated the article.
     */
    private UUID updatedBy;

    private ApprovalStatus approvalStatus;
    private UUID approvedBy;
    private Instant approvedAt;
}
