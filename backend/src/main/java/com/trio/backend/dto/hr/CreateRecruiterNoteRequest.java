package com.trio.backend.dto.hr;

import com.trio.backend.enums.NoteCategory;
import com.trio.backend.enums.NotePriority;
import com.trio.backend.enums.NoteVisibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateRecruiterNoteRequest {

    private UUID candidateId;

    @NotBlank
    @Size(max = 255)
    private String title;

    @NotNull
    private NoteCategory category;

    private NotePriority priority;

    @NotBlank
    @Size(max = 5000)
    private String content;

    @NotNull
    private NoteVisibility visibility;
}
