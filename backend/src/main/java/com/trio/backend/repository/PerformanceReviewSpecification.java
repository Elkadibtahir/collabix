package com.trio.backend.repository;

import com.trio.backend.dto.hr.PerformanceReviewSearchCriteria;
import com.trio.backend.entity.PerformanceReview;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class PerformanceReviewSpecification {

    public static Specification<PerformanceReview> withFilter(UUID departmentId, PerformanceReviewSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("employee").get("department").get("id"), departmentId));

            if (criteria != null) {
                if (criteria.getEmployeeId() != null) {
                    predicates.add(cb.equal(root.get("employee").get("id"), criteria.getEmployeeId()));
                }
                if (criteria.getTeamId() != null) {
                    predicates.add(cb.equal(root.get("team").get("id"), criteria.getTeamId()));
                }
                if (criteria.getReviewerId() != null) {
                    predicates.add(cb.equal(root.get("reviewer").get("id"), criteria.getReviewerId()));
                }
                if (criteria.getStatus() != null) {
                    predicates.add(cb.equal(root.get("status"), criteria.getStatus()));
                }
                if (criteria.getReviewPeriod() != null) {
                    predicates.add(cb.equal(root.get("reviewPeriod"), criteria.getReviewPeriod()));
                }
                if (criteria.getPerformanceLevel() != null) {
                    predicates.add(cb.equal(root.get("performanceLevel"), criteria.getPerformanceLevel()));
                }
                if (criteria.getScoreFrom() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("percentage"), criteria.getScoreFrom()));
                }
                if (criteria.getScoreTo() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("percentage"), criteria.getScoreTo()));
                }
                if (criteria.getDateFrom() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("reviewDate"), criteria.getDateFrom()));
                }
                if (criteria.getDateTo() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("reviewDate"), criteria.getDateTo()));
                }
            }

            query.orderBy(cb.desc(root.get("reviewDate")), cb.desc(root.get("createdAt")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
