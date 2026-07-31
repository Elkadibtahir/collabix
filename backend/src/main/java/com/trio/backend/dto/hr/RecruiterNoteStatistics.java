package com.trio.backend.dto.hr;

import com.trio.backend.enums.NoteCategory;
import com.trio.backend.enums.NotePriority;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class RecruiterNoteStatistics {

    private long totalNotes;
    private long notesToday;
    private long notesThisWeek;
    private Map<NoteCategory, Long> notesByCategory;
    private Map<NotePriority, Long> notesByPriority;
}
