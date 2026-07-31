package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import com.trio.backend.enums.Recommendation;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(
        name = "hr_interview_feedback",
        indexes = {
                @Index(name = "idx_hr_feedback_interview_id", columnList = "interview_id")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewFeedback extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @Min(1)
    @Max(5)
    @Column(name = "rating")
    private Integer rating;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "recommendation", nullable = false, length = 50)
    private Recommendation recommendation;

    @Size(max = 5000)
    @Column(name = "notes", length = 5000)
    private String notes;
}
