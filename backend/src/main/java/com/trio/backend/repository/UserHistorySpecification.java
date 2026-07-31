package com.trio.backend.repository;

import com.trio.backend.dto.user.UserHistorySearchCriteria;
import com.trio.backend.entity.UserHistory;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class UserHistorySpecification {

    public static Specification<UserHistory> withCriteria(UserHistorySearchCriteria criteria, UUID workspaceId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("workspace").get("id"), workspaceId));

            if (criteria.getUserId() != null) {
                predicates.add(cb.equal(root.get("user").get("id"), criteria.getUserId()));
            }

            if (criteria.getAction() != null && !criteria.getAction().isBlank()) {
                predicates.add(cb.equal(root.get("action"), criteria.getAction()));
            }

            if (criteria.getActions() != null && !criteria.getActions().isEmpty()) {
                predicates.add(root.get("action").in(criteria.getActions()));
            }

            if (criteria.getPerformedBy() != null) {
                predicates.add(cb.equal(root.get("performedBy").get("id"), criteria.getPerformedBy()));
            }

            if (criteria.getCreatedAfter() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), criteria.getCreatedAfter()));
            }

            if (criteria.getCreatedBefore() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), criteria.getCreatedBefore()));
            }

            if (criteria.getKeyword() != null && !criteria.getKeyword().isBlank()) {
                String pattern = "%" + criteria.getKeyword().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("description")), pattern),
                        cb.like(cb.lower(root.get("oldValue")), pattern),
                        cb.like(cb.lower(root.get("newValue")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

}
