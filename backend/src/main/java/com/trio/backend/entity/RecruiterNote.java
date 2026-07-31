package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.NoteCategory;
import com.trio.backend.enums.NotePriority;
import com.trio.backend.enums.NoteVisibility;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(
        name = "hr_recruiter_notes",
        indexes = {
                @Index(name = "idx_hr_notes_candidate_id", columnList = "candidate_id"),
                @Index(name = "idx_hr_notes_created_by", columnList = "created_by"),
                @Index(name = "idx_hr_notes_category", columnList = "category"),
                @Index(name = "idx_hr_notes_priority", columnList = "priority"),
                @Index(name = "idx_hr_notes_candidate_created", columnList = "candidate_id, created_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterNote extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @NotBlank
    @Size(max = 255)
    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 20)
    private NoteCategory category;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private NotePriority priority;

    @NotBlank
    @Size(max = 5000)
    @Column(name = "content", nullable = false, length = 5000)
    private String content;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false, length = 20)
    private NoteVisibility visibility;

    @PrePersist
    private void prePersist() {
        if (priority == null) {
            priority = NotePriority.MEDIUM;
        }
    }
}
