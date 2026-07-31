package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.MemberType;
import com.trio.backend.enums.UserStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.BatchSize;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
        name = "users",
        indexes = {
                @Index(name = "idx_user_email", columnList = "email")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User extends AuditableEntity {

    @NotBlank
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @NotBlank
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Email
    @NotBlank
    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank
    @Column(name = "password", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "member_type", nullable = false)
    private MemberType memberType;

    @Builder.Default
    @Column(name = "enabled", nullable = false)
    private boolean enabled = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private UserStatus status;

    @Column(name = "profile_picture")
    private String profilePicture;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @Builder.Default
    @Column(name = "failed_login_attempts", nullable = false)
    private int failedLoginAttempts = 0;

    @Column(name = "locked_at")
    private Instant lockedAt;

    @Column(name = "archived_at")
    private Instant archivedAt;

    /**
     * Primary Department of the user within the workspace (default context).
     * <p>
     * Note: this is an intentional minimal addition; it does not replace the existing
     * team/workspace membership authorization model.
     * </p>
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_department_id")
    private Department primaryDepartment;

@Builder.Default
@OneToMany(
        mappedBy = "user",
        fetch = FetchType.LAZY,
        cascade = {CascadeType.PERSIST, CascadeType.MERGE}
)
@BatchSize(size = 20)
private Set<UserRole> userRoles = new HashSet<>();

@OneToMany(
        mappedBy = "user",
        fetch = FetchType.LAZY,
        cascade = CascadeType.ALL,
        orphanRemoval = true
)
@Builder.Default
@BatchSize(size = 20)
private Set<RefreshToken> refreshTokens = new HashSet<>();

@Builder.Default
@OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
@BatchSize(size = 20)
private Set<WorkspaceMember> workspaceMembers = new HashSet<>();

@Builder.Default
@OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
@BatchSize(size = 20)
private Set<TeamMember> teamMembers = new HashSet<>();

    @PrePersist
    private void prePersist() {
        if (status == null) {
            status = UserStatus.PENDING_ACTIVATION;
        }
    }

}