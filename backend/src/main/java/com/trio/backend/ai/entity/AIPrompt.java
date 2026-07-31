package com.trio.backend.ai.entity;

import com.trio.backend.ai.enums.AIPromptCategory;
import com.trio.backend.entity.base.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ai_prompts")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIPrompt extends AuditableEntity {

    @Column(name = "code", nullable = false, unique = true, length = 100)
    private String code;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 30)
    private AIPromptCategory category;

    @Column(name = "prompt_template", nullable = false, columnDefinition = "TEXT")
    private String promptTemplate;

    @Column(name = "active", nullable = false)
    private Boolean active;

    @Column(name = "description", length = 1000)
    private String description;
}
