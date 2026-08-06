package com.trio.backend.entity;

import com.trio.backend.entity.base.AuditableEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Comment attached to a {@link HandoverEntry}.
 */
@Entity
@Table(
        name = "handover_comments",
        indexes = {
                @Index(name = "idx_handover_comments_entry", columnList = "handover_entry_id")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HandoverComment extends AuditableEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "handover_entry_id", nullable = false)
    private HandoverEntry handoverEntry;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @NotBlank
    @Size(max = 100000)
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;
}
