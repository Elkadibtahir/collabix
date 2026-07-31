package com.trio.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "user_history",
        indexes = {
                @Index(name = "idx_user_history_user_id", columnList = "user_id"),
                @Index(name = "idx_user_history_workspace_id", columnList = "workspace_id"),
                @Index(name = "idx_user_history_action", columnList = "action"),
                @Index(name = "idx_user_history_performed_by", columnList = "performed_by"),
                @Index(name = "idx_user_history_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserHistory {

    public static final String ACTION_USER_CREATED = "USER_CREATED";
    public static final String ACTION_INVITATION_SENT = "INVITATION_SENT";
    public static final String ACTION_INVITATION_ACCEPTED = "INVITATION_ACCEPTED";
    public static final String ACTION_PROFILE_UPDATED = "PROFILE_UPDATED";
    public static final String ACTION_EMAIL_CHANGED = "EMAIL_CHANGED";
    public static final String ACTION_PROFILE_PICTURE_UPDATED = "PROFILE_PICTURE_UPDATED";
    public static final String ACTION_DEPARTMENT_CHANGED = "DEPARTMENT_CHANGED";
    public static final String ACTION_ROLE_ASSIGNED = "ROLE_ASSIGNED";
    public static final String ACTION_ROLE_REMOVED = "ROLE_REMOVED";
    public static final String ACTION_ACTIVATED = "ACTIVATED";
    public static final String ACTION_DEACTIVATED = "DEACTIVATED";
    public static final String ACTION_SUSPENDED = "SUSPENDED";
    public static final String ACTION_REACTIVATED = "REACTIVATED";
    public static final String ACTION_ARCHIVED = "ARCHIVED";
    public static final String ACTION_RESTORED = "RESTORED";
    public static final String ACTION_SOFT_DELETED = "SOFT_DELETED";
    public static final String ACTION_PASSWORD_RESET = "PASSWORD_RESET";

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by")
    private User performedBy;

    @NotBlank
    @Size(max = 50)
    @Column(name = "action", nullable = false, length = 50)
    private String action;

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    private void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
