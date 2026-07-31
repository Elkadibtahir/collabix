package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.ApprovalStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * KnowledgeBase represents an article in a project's knowledge base.
 *
 * <p>Architecture notes:</p>
 * <ul>
 *     <li>A KnowledgeBase belongs to exactly one Project (required).</li>
 *     <li>Tenant isolation is ensured via the chain: KnowledgeBase -> Project -> Department -> Workspace.</li>
 *     <li>Accessible by all authorized members of the project for knowledge sharing.</li>
 *     <li>Designed for future enhancements: Versioning, Categories, Tags, AI Search, RAG, Linking, History, Favorites, Analytics.</li>
 *     <li>Soft-delete status via KnowledgeBaseStatus enum.</li>
 *     <li>Content stored as text for search, analytics, and AI processing.</li>
 *     <li>Version tracking fields prepared for future implementation without schema changes.</li>
 * </ul>
 */
@Entity
@Table(
        name = "knowledge_bases",
        indexes = {
                @Index(name = "idx_knowledge_bases_project_id", columnList = "project_id"),
                @Index(name = "idx_knowledge_bases_status", columnList = "status"),
                @Index(name = "idx_knowledge_bases_created_at", columnList = "created_at"),
                @Index(name = "idx_knowledge_bases_project_status", columnList = "project_id, status"),
                @Index(name = "idx_knowledge_bases_created_by", columnList = "created_by"),
                @Index(name = "idx_knowledge_bases_category", columnList = "category"),
                @Index(name = "idx_knowledge_bases_is_pinned", columnList = "is_pinned")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgeBase extends AuditableEntity {

    /**
     * The Project this knowledge base article belongs to.
     * Required. Lazy loaded to optimize query performance.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    /**
     * The title of the knowledge base article.
     * Required for user-facing reference, search, and categorization.
     */
    @NotBlank(message = "Knowledge base title is required")
    @Column(name = "title", nullable = false, length = 255)
    private String title;

    /**
     * The content of the knowledge base article.
     * Required for storage and AI processing (search, summarization, RAG).
     */
    @NotBlank(message = "Knowledge base content is required")
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    /**
     * Brief summary or excerpt of the article.
     * Optional for preview, search results, and dashboard display.
     */
    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    /**
     * The category of this knowledge base article.
     * Prepared for future category-based filtering and organization.
     * Examples: FAQ, Best Practices, Documentation, Troubleshooting, Tutorial.
     */
    @Column(name = "category", length = 100)
    private String category;

    /**
     * Comma-separated tags for article classification.
     * Prepared for future tag-based search and filtering.
     * Examples: "api,integration,automation", "bug-fix,performance".
     */
    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags;

    /**
     * The status of the knowledge base article (ACTIVE, ARCHIVED, DELETED).
     * Used for soft-delete support without removing data.
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private KnowledgeBaseStatus status = KnowledgeBaseStatus.ACTIVE;

    /**
     * Current version number of the article.
     * Prepared for future Versioning implementation.
     * Starts at 1 for initial creation.
     */
    @NotNull
    @Positive(message = "Version must be positive")
    @Column(name = "article_version", nullable = false) // Updated column name
    private Integer articleVersion = 1;

    /**
     * Flag indicating whether this article is pinned/featured.
     * Prepared for future pinning/favoriting functionality.
     * Pinned articles appear first in listings.
     */
    @Column(name = "is_pinned")
    private Boolean isPinned = false;

    /**
     * Flag indicating whether the article content has been processed by AI.
     * Prepared for future AI integration (summarization, tagging, enhancement).
     * False by default, set to true after AI processing completes.
     */
    @Column(name = "ai_processed")
    private Boolean aiProcessed = false;

    /**
     * AI-generated summary of the article.
     * Prepared for future AI-powered summarization.
     * Null until AI processing is completed.
     */
    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    /**
     * AI-generated tags for the article.
     * Prepared for future AI-powered tagging.
     * Null until AI processing is completed.
     */
    @Column(name = "ai_tags", columnDefinition = "TEXT")
    private String aiTags;

    /**
     * Flag indicating whether RAG (Retrieval-Augmented Generation) embeddings are available.
     * Prepared for future RAG/Vector Search implementation.
     * False by default, set to true after embedding generation.
     */
    @Column(name = "rag_embeddings_available")
    private Boolean ragEmbeddingsAvailable = false;

    /**
     * Number of times this article has been viewed.
     * Prepared for future analytics and popularity tracking.
     * Used for dashboard metrics and trending articles.
     */
    @Column(name = "view_count")
    private Long viewCount = 0L;

    /**
     * Number of times this article has been favorited by members.
     * Prepared for future favorites and bookmarking.
     * Used for dashboard metrics and personalization.
     */
    @Column(name = "favorite_count")
    private Long favoriteCount = 0L;

    /**
     * Timestamp of last consultation/view.
     * Prepared for future analytics on article freshness and relevance.
     */
    @Column(name = "last_viewed_at")
    private LocalDateTime lastViewedAt;

    /**
     * ID of the user who last viewed this article.
     * Prepared for future analytics and user activity tracking.
     */
    @Column(name = "last_viewed_by")
    private UUID lastViewedBy;

    /**
     * Approval status for article publishing workflow.
     * PENDING — awaiting manager review.
     * APPROVED — reviewed and published.
     * REJECTED — rejected by reviewer.
     * Defaults to APPROVED for backward compatibility.
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false, length = 20)
    private ApprovalStatus approvalStatus = ApprovalStatus.APPROVED;

    /**
     * ID of the user who approved/rejected this article.
     * Null if not yet reviewed.
     */
    @Column(name = "approved_by")
    private UUID approvedBy;

    /**
     * Timestamp when the article was approved/rejected.
     * Null if not yet reviewed.
     */
    @Column(name = "approved_at")
    private Instant approvedAt;

    /**
     * Initialize status and defaults if not set during entity creation.
     * Ensures consistent default state.
     */
    @PrePersist
    private void prePersist() {
        if (status == null) {
            status = KnowledgeBaseStatus.ACTIVE;
        }
        if (articleVersion == null) {
            articleVersion = 1;
        }
        if (isPinned == null) {
            isPinned = false;
        }
        if (aiProcessed == null) {
            aiProcessed = false;
        }
        if (ragEmbeddingsAvailable == null) {
            ragEmbeddingsAvailable = false;
        }
        if (viewCount == null) {
            viewCount = 0L;
        }
        if (favoriteCount == null) {
            favoriteCount = 0L;
        }
        if (approvalStatus == null) {
            approvalStatus = ApprovalStatus.APPROVED;
        }
    }

    /**
     * Enum for KnowledgeBase status.
     * Supports soft-delete and archiving without data loss.
     */
    public enum KnowledgeBaseStatus {
        ACTIVE,
        ARCHIVED,
        DELETED
    }
}
