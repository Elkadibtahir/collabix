package com.trio.backend.repository;

import com.trio.backend.dto.dev.SprintSearchCriteria;
import com.trio.backend.entity.Sprint;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class SprintSpecification {

    public static Specification<Sprint> withFilter(UUID departmentId, SprintSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("department").get("id"), departmentId));

            if (criteria != null) {
                if (criteria.getProjectId() != null) {
                    predicates.add(cb.equal(root.get("project").get("id"), criteria.getProjectId()));
                }
                if (criteria.getTeamId() != null) {
                    predicates.add(cb.equal(root.get("team").get("id"), criteria.getTeamId()));
                }
                if (criteria.getStatus() != null) {
                    predicates.add(cb.equal(root.get("status"), criteria.getStatus()));
                }
                if (criteria.getDateFrom() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("startDate"), criteria.getDateFrom()));
                }
                if (criteria.getDateTo() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("endDate"), criteria.getDateTo()));
                }
                if (criteria.getName() != null && !criteria.getName().isBlank()) {
                    predicates.add(cb.like(cb.lower(root.get("name")),
                            "%" + criteria.getName().toLowerCase() + "%"));
                }
            }

            query.orderBy(cb.desc(root.get("createdAt")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
