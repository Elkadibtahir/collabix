package com.trio.backend.repository;

import com.trio.backend.dto.cyber.SecurityAuditSearchCriteria;
import com.trio.backend.entity.SecurityAudit;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class SecurityAuditSpecification {

    public static Specification<SecurityAudit> withFilter(UUID departmentId, SecurityAuditSearchCriteria criteria) {
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
                if (criteria.getAuditType() != null) {
                    predicates.add(cb.equal(root.get("auditType"), criteria.getAuditType()));
                }
                if (criteria.getPriority() != null) {
                    predicates.add(cb.equal(root.get("priority"), criteria.getPriority()));
                }
                if (criteria.getDateFrom() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("startDate"), criteria.getDateFrom()));
                }
                if (criteria.getDateTo() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("endDate"), criteria.getDateTo()));
                }
                if (criteria.getKeyword() != null && !criteria.getKeyword().isBlank()) {
                    predicates.add(cb.like(cb.lower(root.get("name")),
                            "%" + criteria.getKeyword().toLowerCase() + "%"));
                }
            }

            query.orderBy(cb.desc(root.get("createdAt")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
