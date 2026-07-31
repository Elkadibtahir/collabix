package com.trio.backend.dto.hr;

import com.trio.backend.enums.NoteCategory;
import com.trio.backend.enums.NotePriority;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class RecruiterNoteSearchCriteria {

    private UUID candidateId;
    private NoteCategory category;
    private NotePriority priority;
    private UUID authorId;
    private Instant dateFrom;
    private Instant dateTo;
    private String keyword;
}
