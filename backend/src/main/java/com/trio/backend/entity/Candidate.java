package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.CandidateSource;
import com.trio.backend.enums.CandidateStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "hr_candidates",
        indexes = {
                @Index(name = "idx_hr_candidates_department_id", columnList = "department_id"),
                @Index(name = "idx_hr_candidates_status", columnList = "current_status"),
                @Index(name = "idx_hr_candidates_email", columnList = "email"),
                @Index(name = "idx_hr_candidates_department_status", columnList = "department_id, current_status")
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_hr_candidates_department_email",
                        columnNames = {"department_id", "email"}
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Candidate extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @NotBlank
    @Size(max = 100)
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @NotBlank
    @Size(max = 100)
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @NotBlank
    @Email
    @Size(max = 255)
    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Size(max = 50)
    @Column(name = "phone", length = 50)
    private String phone;

    @NotBlank
    @Size(max = 150)
    @Column(name = "position", nullable = false, length = 150)
    private String position;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", length = 50)
    private CandidateSource source;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "current_status", nullable = false, length = 50)
    private CandidateStatus currentStatus;

    @Column(name = "recruiter_id")
    private UUID recruiterId;

    @Column(name = "archived", nullable = false)
    private boolean archived;

    @Builder.Default
    @OneToMany(mappedBy = "candidate", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CandidateStatusHistory> statusHistories = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "candidate", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Interview> interviews = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "candidate", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecruiterNote> notes = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "candidate", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CandidateAttachment> attachments = new ArrayList<>();

    @PrePersist
    private void prePersist() {
        if (currentStatus == null) {
            currentStatus = CandidateStatus.APPLIED;
        }
    }
}
