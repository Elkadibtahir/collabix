package com.trio.backend.repository;

import com.trio.backend.dto.hr.HrNotificationSearchCriteria;
import com.trio.backend.entity.Notification;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class HrNotificationSpecification {

    public static Specification<Notification> withFilter(UUID workspaceId, HrNotificationSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("workspace").get("id"), workspaceId));

            if (criteria != null) {
                if (criteria.getRecipientId() != null) {
                    predicates.add(cb.equal(root.get("recipient").get("id"), criteria.getRecipientId()));
                }
                if (criteria.getNotificationType() != null) {
                    predicates.add(cb.equal(root.get("notificationType"), criteria.getNotificationType()));
                }
                if (criteria.getStatus() != null) {
                    predicates.add(cb.equal(root.get("status"), criteria.getStatus()));
                }
                if (criteria.getDateFrom() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), criteria.getDateFrom()));
                }
                if (criteria.getDateTo() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), criteria.getDateTo()));
                }
            }

            query.orderBy(cb.desc(root.get("createdAt")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
