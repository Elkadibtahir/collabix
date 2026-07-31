package com.trio.backend.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserHistoryResponse {

    private UUID id;

    private UUID userId;

    private String userEmail;

    private String userFullName;

    private UUID workspaceId;

    private String workspaceName;

    private UUID performedById;

    private String performedByEmail;

    private String performedByName;

    private String action;

    private String oldValue;

    private String newValue;

    private String description;

    private Instant createdAt;

}
