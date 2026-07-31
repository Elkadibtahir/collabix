package com.trio.backend.entity;


import com.trio.backend.entity.ids.WorkspaceMemberId;
import com.trio.backend.enums.WorkspaceMemberStatus;
import com.trio.backend.enums.WorkspaceRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;

@Entity
@Table(
        name = "workspace_members",
        indexes = {
                @Index(name = "idx_workspace_members_user_id", columnList = "user_id"),
                @Index(name = "idx_workspace_members_workspace_id", columnList = "workspace_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkspaceMember {

    // Important: BaseEntity already defines an `id` (UUID). Using `id` here would
    // conflict with the generated getter/setter and break compilation.
    @EmbeddedId
    private WorkspaceMemberId workspaceMemberId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("workspaceId")
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private WorkspaceRole role;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private WorkspaceMemberStatus status;

    @NotNull
    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt;

    @Column(name = "left_at")
    private Instant leftAt;

    @Email
    @Column(name = "invitation_email", length = 150)
    private String invitationEmail;

    @Column(name = "invited_at")
    private Instant invitedAt;

    @Column(name = "invited_accepted_at")
    private Instant invitedAcceptedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    private void prePersist() {
        if (joinedAt == null) {
            joinedAt = Instant.now();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
