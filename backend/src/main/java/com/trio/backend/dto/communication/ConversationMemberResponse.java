package com.trio.backend.dto.communication;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class ConversationMemberResponse {

    private UUID userId;
    private String firstName;
    private String lastName;
    private String email;
    private String profilePicture;
    private String role;
    private Instant joinedAt;
    private Instant lastReadAt;
}
