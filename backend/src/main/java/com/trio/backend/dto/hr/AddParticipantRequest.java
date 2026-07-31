package com.trio.backend.dto.hr;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class AddParticipantRequest {

    @NotNull
    private UUID userId;

    @Size(max = 50)
    private String role;
}
