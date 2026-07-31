package com.trio.backend.ai.entity;

import com.trio.backend.ai.enums.AIProvider;
import com.trio.backend.entity.base.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "ai_history")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIHistory extends AuditableEntity {

    @Column(name = "user_id", nullable = false)
    private UUID user;

    @Column(name = "workspace_id", nullable = false)
    private UUID workspace;

    @Column(name = "department_id", nullable = false)
    private UUID department;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false, length = 20)
    private AIProvider provider;

    @Column(name = "model", nullable = false, length = 100)
    private String model;

    @Column(name = "prompt", nullable = false, columnDefinition = "TEXT")
    private String prompt;

    @Column(name = "response", nullable = false, columnDefinition = "TEXT")
    private String response;

    @Column(name = "execution_time", nullable = false)
    private Long executionTime;

    @Column(name = "token_count")
    private Integer tokenCount;

    @Column(name = "success", nullable = false)
    private Boolean success;
}
