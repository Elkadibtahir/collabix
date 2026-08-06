package com.trio.backend.repository;

import com.trio.backend.entity.HandoverTimelineEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Repository for the HandoverTimelineEvent (journal timeline) entity.
 */
@Repository
public interface HandoverTimelineEventRepository extends JpaRepository<HandoverTimelineEvent, UUID> {

    @Query("""
            SELECT e FROM HandoverTimelineEvent e
            WHERE e.handoverEntry.id = :handoverEntryId
            ORDER BY e.occurredAt ASC
            """)
    List<HandoverTimelineEvent> findByHandoverEntryIdOrderByOccurredAtAsc(
            @Param("handoverEntryId") UUID handoverEntryId
    );

    @Query("""
            SELECT COUNT(e) > 0 FROM HandoverTimelineEvent e
            WHERE e.handoverEntry.id = :handoverEntryId
              AND e.eventType = 'REMINDER_SENT'
              AND e.occurredAt >= :since
            """)
    boolean existsReminderSentSince(
            @Param("handoverEntryId") UUID handoverEntryId,
            @Param("since") Instant since
    );
}
