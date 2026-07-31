package com.trio.backend.repository;

import com.trio.backend.dto.hr.OnboardingSearchCriteria;
import com.trio.backend.entity.Onboarding;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class OnboardingSpecification {

    public static Specification<Onboarding> withFilter(UUID departmentId, OnboardingSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("employee").get("department").get("id"), departmentId));

            if (criteria != null) {
                if (criteria.getEmployeeId() != null) {
                    predicates.add(cb.equal(root.get("employee").get("id"), criteria.getEmployeeId()));
                }
                if (criteria.getStatus() != null) {
                    predicates.add(cb.equal(root.get("status"), criteria.getStatus()));
                }
                if (criteria.getAssignedHrId() != null) {
                    predicates.add(cb.equal(root.get("assignedHrId"), criteria.getAssignedHrId()));
                }
                if (criteria.getStartDateFrom() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("startDate"), criteria.getStartDateFrom()));
                }
                if (criteria.getStartDateTo() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("startDate"), criteria.getStartDateTo()));
                }
                if (criteria.getKeyword() != null && !criteria.getKeyword().isBlank()) {
                    String pattern = "%" + criteria.getKeyword().toLowerCase() + "%";
                    predicates.add(cb.or(
                            cb.like(cb.lower(root.get("notes")), pattern)
                    ));
                }
            }

            query.orderBy(cb.desc(root.get("createdAt")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
