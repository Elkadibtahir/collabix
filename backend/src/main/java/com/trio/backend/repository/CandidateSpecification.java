package com.trio.backend.repository;

import com.trio.backend.dto.hr.CandidateSearchCriteria;
import com.trio.backend.entity.Candidate;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class CandidateSpecification {

    public static Specification<Candidate> withFilter(UUID departmentId, CandidateSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("department").get("id"), departmentId));
            predicates.add(cb.equal(root.get("archived"), false));

            if (criteria != null) {
                if (criteria.getKeyword() != null && !criteria.getKeyword().isBlank()) {
                    String pattern = "%" + criteria.getKeyword().toLowerCase() + "%";
                    predicates.add(cb.or(
                            cb.like(cb.lower(root.get("firstName")), pattern),
                            cb.like(cb.lower(root.get("lastName")), pattern),
                            cb.like(cb.lower(root.get("email")), pattern)
                    ));
                }
                if (criteria.getStatus() != null) {
                    predicates.add(cb.equal(root.get("currentStatus"), criteria.getStatus()));
                }
                if (criteria.getRecruiterId() != null) {
                    predicates.add(cb.equal(root.get("recruiterId"), criteria.getRecruiterId()));
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
