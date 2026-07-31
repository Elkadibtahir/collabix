package com.trio.backend.dto.organisation.handover;

import com.trio.backend.entity.HandoverJournal;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response for un HandoverJournal generated automaticment.
 *
 * <p>Conventions architecturals respectsd :</p>
 * <ul>
 *     <li>Aplatissement des objects relationnels sous forme de clÃƒÂ©s pivots (UUID).</li>
 *     <li>Absence de validations (Bean Validation) : DTO used excludedsivement en flow de output (Read/Response).</li>
 *     <li>Exposition des mÃƒÂ©tagivens d'audit (Instant) alignÃƒÂ©es sur AuditableEntity.</li>
 * </ul>
 */
@Getter
@Setter
public class HandoverJournalResponse {

    private UUID id;

    // =========================================================================
    // ClÃƒÂ©s de partitionnement / Isolement multi-tenant
    // =========================================================================
    private UUID workspaceId;
    private UUID departmentId;
    private UUID projectId;

    // =========================================================================
    // MÃƒÂ©tagivens temporelles et contextuelles du log
    // =========================================================================
    private HandoverJournal.Shift shift;
    private LocalDateTime logDate;

    // =========================================================================
    // Contents textuels consolidÃƒÂ©s par le moteur de synthÃƒÂ¨se (IA)
    // =========================================================================
    private String generatedSummary;
    private String mainDoneWork;
    private String mainRemainingWork;
    private String blockers;
    private String difficulties;
    private String recommendations;

    // =========================================================================
    // States du cycle de generation automatic
    // =========================================================================
    private HandoverJournal.GenerationStatus generationStatus;
    private LocalDateTime generationDate;
    private UUID generationProcessedBy;

    // =========================================================================
    // Cycle de vie / Soft Delete
    // =========================================================================
    private HandoverJournal.HandoverJournalStatus status;

    // =========================================================================
    // Traces d'audit (HÃƒÂ©ritÃƒÂ©es de AuditableEntity)
    // =========================================================================
    private Instant createdAt;
    private Instant updatedAt;
}