package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.BatchSize;

import java.time.Instant;
import java.util.UUID;

/**
 * Notification represents a platform notification addressed to a specific user
 * within a Workspace.
 *
 * <p>Architecture notes:</p>
 * <ul>
 *     <li>Notifications are a shared platform module used by every department
 *         (HR, Development, AI, Marketing, Cybersecurity, etc.).</li>
 *     <li>A Notification belongs to exactly one {@link Workspace} for tenant isolation.</li>
 *     <li>A Notification is always addressed to exactly one recipient {@link User}.</li>
 *     <li>A Notification may optionally reference one business resource
 *         (Project, Task, Comment, Document, KnowledgeBase, HandoverEntry).</li>
 *     <li>Tenant isolation is ensured by the mandatory Workspace relationship.</li>
 *     <li>Soft-delete and read tracking are handled through {@link NotificationStatus}.</li>
 *     <li>The entity is designed to be extensible for future modules without modification:
 *         new resource types can be added via the {@code resourceType} + {@code resourceId}
 *         generic pattern, while existing relationships cover the current business entities.</li>
 *     <li>Future resource types (e.g., Candidate, ATS, AI Job) can be represented
 *         using the generic {@code resourceType} and {@code resourceId} fields without
 *        requiring schema changes to this table.</li>
 * </ul>
 */
@Entity
@Table(
        name = "notifications",
        indexes = {
                @Index(name = "idx_notifications_workspace_id", columnList = "workspace_id"),
                @Index(name = "idx_notifications_recipient_id", columnList = "recipient_id"),
                @Index(name = "idx_notifications_recipient_status", columnList = "recipient_id, status"),
                @Index(name = "idx_notifications_recipient_created", columnList = "recipient_id, created_at"),
                @Index(name = "idx_notifications_type", columnList = "notification_type"),
                @Index(name = "idx_notifications_status", columnList = "status"),
                @Index(name = "idx_notifications_created_at", columnList = "created_at"),
                @Index(name = "idx_notifications_resource_type_id", columnList = "resource_type, resource_id"),
                @Index(name = "idx_notifications_project_id", columnList = "project_id"),
                @Index(name = "idx_notifications_task_id", columnList = "task_id"),
                @Index(name = "idx_notifications_read_at", columnList = "read_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@BatchSize(size = 20)
public class Notification extends AuditableEntity {

    // =========================================================================
    // Mandatory context
    // =========================================================================

    /**
     * The Workspace this notification belongs to.
     * Required for tenant isolation and multi-tenant compatibility.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workspace_id", nullable = false, updatable = false)
    private Workspace workspace;

    /**
     * The recipient User of this notification.
     * Required. Always addressed to exactly one user.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false, updatable = false)
    private User recipient;

    // =========================================================================
    // Notification content
    // =========================================================================

    /**
     * The type of notification.
     * Required. Identifies the business event that triggered the notification.
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false, length = 50)
    private NotificationType notificationType;

    /**
     * The title of the notification.
     * Required. Short, user-facing summary.
     */
    @NotBlank
    @Size(max = 255)
    @Column(name = "title", nullable = false, length = 255)
    private String title;

    /**
     * The body/content of the notification.
     * Optional. Detailed message for the recipient.
     */
    @Size(max = 2000)
    @Column(name = "body", length = 2000)
    private String body;

    /**
     * Optional deep-link URL that the recipient can follow to view the
     * referenced resource directly.
     */
    @Size(max = 500)
    @Column(name = "link_url", length = 500)
    private String linkUrl;

    // =========================================================================
    // Optional business resource references (specific relationships)
    // =========================================================================

    /**
     * Optional reference to a Project.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "project_id", nullable = true, updatable = false)
    private Project project;

    /**
     * Optional reference to a Task.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "task_id", nullable = true, updatable = false)
    private Task task;

    /**
     * Optional reference to a Comment.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "comment_id", nullable = true, updatable = false)
    private Comment comment;

    /**
     * Optional reference to a Document.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "document_id", nullable = true, updatable = false)
    private Document document;

    /**
     * Optional reference to a KnowledgeBase article.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "knowledge_base_id", nullable = true, updatable = false)
    private KnowledgeBase knowledgeBase;

    /**
     * Optional reference to a HandoverEntry.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "handover_entry_id", nullable = true, updatable = false)
    private HandoverEntry handoverEntry;

    // =========================================================================
    // Generic resource reference (future modules)
    // =========================================================================

    /**
     * Generic resource type for future modules that do not yet have a dedicated
     * relationship column (e.g., "CANDIDATE", "ATS", "AI_JOB").
     *
     * <p>When this field is populated, {@link #resourceId} should also be set.
     * This allows the platform to reference any future resource type without
     * requiring schema changes to the notifications table.</p>
     */
    @Size(max = 50)
    @Column(name = "resource_type", length = 50)
    private String resourceType;

    /**
     * Generic resource identifier for future modules.
     *
     * <p>Used in conjunction with {@link #resourceType} to reference resources
     * that do not yet have a dedicated relationship column.</p>
     */
    @Column(name = "resource_id")
    private UUID resourceId;

    // =========================================================================
    // Classification
    // =========================================================================

    /**
     * Priority level of this notification.
     * <ul>
     *     <li>{@code LOW} — informational, no urgency</li>
     *     <li>{@code NORMAL} — default priority</li>
     *     <li>{@code HIGH} — requires prompt attention</li>
     *     <li>{@code URGENT} — requires immediate action</li>
     * </ul>
     */
    @Column(name = "priority", nullable = false, length = 10)
    private String priority = "NORMAL";

    /**
     * Functional category for grouping/filtering.
     * Examples: TASK, COMMENT, DOCUMENT, KNOWLEDGE, HANDOVER, HR, AI, SECURITY, MARKETING
     */
    @Column(name = "category", length = 50)
    private String category;

    /**
     * An optional group key for batching related notifications together.
     * All notifications sharing the same groupKey can be collapsed into a single entry.
     */
    @Column(name = "group_key", length = 100)
    private String groupKey;

    // =========================================================================
    // Read tracking & soft delete
    // =========================================================================

    /**
     * Timestamp indicating when the notification was read by the recipient.
     * Null until the notification is marked as read.
     */
    @Column(name = "read_at")
    private Instant readAt;

    /**
     * The status of the notification for soft-delete and lifecycle management.
     * <ul>
     *     <li>{@link NotificationStatus#UNREAD} — notification has not been seen</li>
     *     <li>{@link NotificationStatus#READ} — notification has been read</li>
     *     <li>{@link NotificationStatus#DISMISSED} — notification has been dismissed without being read</li>
     *     <li>{@link NotificationStatus#ARCHIVED} — notification has been archived (soft-delete)</li>
     * </ul>
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private NotificationStatus status = NotificationStatus.UNREAD;

    @PrePersist
    private void prePersist() {
        if (status == null) {
            status = NotificationStatus.UNREAD;
        }
    }

    // =========================================================================
    // Enums
    // =========================================================================

    /**
     * Status values for the Notification lifecycle.
     * Supports soft-delete via ARCHIVED status.
     */
    public enum NotificationStatus {
        UNREAD,
        READ,
        DISMISSED,
        ARCHIVED
    }

    /**
     * Types of notifications supported by the platform.
     *
     * <p>Each value corresponds to a specific business event that can trigger
     * a notification. Values marked {@code @Deprecated(forRemoval = true)}
     * are not currently produced by any service and will be removed in a future
     * release. Retained to avoid breaking existing rows in the database.</p>
     */
    public enum NotificationType {
        /** @deprecated No service currently produces this type. */
        @Deprecated(forRemoval = true) TASK_ASSIGNED,
        /** @deprecated No service currently produces this type. */
        @Deprecated(forRemoval = true) NEW_COMMENT,
        MENTION,
        DOCUMENT_UPLOADED,
        /** @deprecated No service currently produces this type. */
        @Deprecated(forRemoval = true) KNOWLEDGE_PUBLISHED,
        /** @deprecated No service currently produces this type. */
        @Deprecated(forRemoval = true) HANDOVER_GENERATED,
        HANDOVER_REMINDER,
        CANDIDATE_UPDATED,
        ATS_STATUS_CHANGED,
        /** @deprecated No service currently produces this type. */
        @Deprecated(forRemoval = true) AI_JOB_COMPLETED,
        ATTENDANCE_CHECK_IN,
        ATTENDANCE_CHECK_OUT,
        ATTENDANCE_CORRECTED,
        ATTENDANCE_MISSING_CHECKOUT,
        ATTENDANCE_LATE_ARRIVAL,
        ATTENDANCE_EXCESSIVE_OVERTIME,
        REVIEW_ASSIGNED,
        REVIEW_SUBMITTED,
        REVIEW_APPROVED,
        REVIEW_REJECTED,
        CANDIDATE_CREATED,
        INTERVIEW_SCHEDULED,
        INTERVIEW_CANCELLED,
        INTERVIEW_COMPLETED,
        RECRUITER_NOTE_ADDED,
        ATTACHMENT_UPLOADED,
        ATTACHMENT_REPLACED,
        EMPLOYEE_CREATED,
        EMPLOYEE_TRANSFERRED,
        MANAGER_CHANGED,
        DEPARTMENT_CHANGED,
        TEAM_CHANGED,
        SKILL_ADDED,
        SKILL_VERIFIED,
        CERTIFICATION_EXPIRING,
        ONBOARDING_STARTED,
        ONBOARDING_COMPLETED,
        ONBOARDING_OVERDUE,
        SPRINT_CREATED,
        SPRINT_STARTED,
        SPRINT_COMPLETED,
        /** @deprecated No service currently produces this type. */
        @Deprecated(forRemoval = true) SPRINT_CANCELLED,
        SPRINT_ARCHIVED,
        MODEL_CREATED,
        MODEL_STATUS_CHANGED,
        MODEL_ARCHIVED,
        /** @deprecated No service currently produces this type. */
        @Deprecated(forRemoval = true) MODEL_READY,
        MODEL_DEPLOYED,
        AUDIT_CREATED,
        AUDIT_STARTED,
        AUDIT_COMPLETED,
        AUDIT_ARCHIVED,
        CAMPAIGN_CREATED,
        CAMPAIGN_STARTED,
        CAMPAIGN_COMPLETED,
        CAMPAIGN_ARCHIVED,
        NEW_MESSAGE,
        CHANNEL_INVITE,
        HANDOVER_SENT,
        HANDOVER_ACCEPTED,
        HANDOVER_REJECTED,
        HANDOVER_COMPLETED,
        HANDOVER_COMMENTED
    }
}
