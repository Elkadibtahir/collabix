package com.trio.backend.dto.hr;

import com.trio.backend.enums.NoteCategory;
import com.trio.backend.enums.NotePriority;
import com.trio.backend.enums.NoteVisibility;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateRecruiterNoteRequest {

    @Size(max = 255)
    private String title;

    private NoteCategory category;

    private NotePriority priority;

    @Size(max = 5000)
    private String content;

    private NoteVisibility visibility;
}
