package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.CandidateStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
        name = "hr_candidate_status_histories",
        indexes = {
                @Index(name = "idx_hr_csh_candidate_id", columnList = "candidate_id"),
                @Index(name = "idx_hr_csh_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateStatusHistory extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 50)
    private CandidateStatus previousStatus;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 50)
    private CandidateStatus newStatus;

    @Column(name = "changed_by")
    private UUID changedBy;

    @Size(max = 1000)
    @Column(name = "reason", length = 1000)
    private String reason;
}
