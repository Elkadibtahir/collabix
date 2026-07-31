package com.trio.backend.service;

import com.trio.backend.dto.organisation.handover.HandoverJournalResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * Service interface for HandoverJournal operations.
 *
 * Enforces deep validation of the tenant yesterdayarchy:
 * Workspace -> Department -> Project -> HandoverJournal.
 *
 * Note: Handover logs are excludedsively system-generated or AI-synthesized.
 * Manual creation via a standard create() method is ssortctly prohibited.
 */
public interface HandoverJournalService {

    /**
     * Triggers the automated generation engine to produce a new daily or shift log.
     */
    HandoverJournalResponse generateJournal(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId
    );

    /**
     * Resorteves a specific handover log after validating its Complete multi-tenant path yesterdayarchy.
     */
    HandoverJournalResponse getById(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID handoverJournalId
    );

    /**
     * Returns a paginated list of handover logs scoped under a specific project boundary.
     */
    Page<HandoverJournalResponse> list(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            Pageable pageable
    );

    /**
     * Re-runs the synthesis algorithm to update an existing log with recent mutations or corrections.
     */
    HandoverJournalResponse regenerate(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID handoverJournalId
    );

    /**
     * Performs a logical soft-delete on the targeted handover log.
     */
    void delete(
            UUID workspaceId,
            UUID departmentId,
            UUID projectId,
            UUID handoverJournalId
    );
}