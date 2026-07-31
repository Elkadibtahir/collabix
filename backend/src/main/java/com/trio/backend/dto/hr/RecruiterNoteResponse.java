package com.trio.backend.dto.hr;

import com.trio.backend.enums.NoteCategory;
import com.trio.backend.enums.NotePriority;
import com.trio.backend.enums.NoteVisibility;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class RecruiterNoteResponse {

    private UUID id;
    private UUID candidateId;
    private String title;
    private NoteCategory category;
    private NotePriority priority;
    private String content;
    private NoteVisibility visibility;
    private UUID createdBy;
    private Instant createdAt;
    private Instant updatedAt;
}
