package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.AnnouncementStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor
@Setter
@Table(
        name = "announcements",
        indexes = {
                @Index(name = "idx_announcements_workspace_id", columnList = "workspace_id"),
                @Index(name = "idx_announcements_department_id", columnList = "department_id"),
                @Index(name = "idx_announcements_team_id", columnList = "team_id"),
                @Index(name = "idx_announcements_project_id", columnList = "project_id"),
                @Index(name = "idx_announcements_status", columnList = "status"),
                @Index(name = "idx_announcements_is_pinned", columnList = "is_pinned"),
                @Index(name = "idx_announcements_created_at", columnList = "created_at"),
                @Index(name = "idx_announcements_workspace_status", columnList = "workspace_id, status"),
                @Index(name = "idx_announcements_workspace_pinned", columnList = "workspace_id, is_pinned, status")
        }
)
public class Announcement extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @NotBlank
    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @NotBlank
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "is_pinned")
    private boolean isPinned;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AnnouncementStatus status = AnnouncementStatus.ACTIVE;
}
