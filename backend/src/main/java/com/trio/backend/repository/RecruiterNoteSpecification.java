package com.trio.backend.repository;

import com.trio.backend.dto.hr.RecruiterNoteSearchCriteria;
import com.trio.backend.entity.RecruiterNote;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class RecruiterNoteSpecification {

    public static Specification<RecruiterNote> withFilter(UUID departmentId, RecruiterNoteSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("candidate").get("department").get("id"), departmentId));

            if (criteria != null) {
                if (criteria.getCandidateId() != null) {
                    predicates.add(cb.equal(root.get("candidate").get("id"), criteria.getCandidateId()));
                }
                if (criteria.getCategory() != null) {
                    predicates.add(cb.equal(root.get("category"), criteria.getCategory()));
                }
                if (criteria.getPriority() != null) {
                    predicates.add(cb.equal(root.get("priority"), criteria.getPriority()));
                }
                if (criteria.getAuthorId() != null) {
                    predicates.add(cb.equal(root.get("createdBy"), criteria.getAuthorId()));
                }
                if (criteria.getDateFrom() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), criteria.getDateFrom()));
                }
                if (criteria.getDateTo() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), criteria.getDateTo()));
                }
                if (criteria.getKeyword() != null && !criteria.getKeyword().isBlank()) {
                    String pattern = "%" + criteria.getKeyword().toLowerCase() + "%";
                    predicates.add(cb.or(
                            cb.like(cb.lower(root.get("title")), pattern),
                            cb.like(cb.lower(root.get("content")), pattern)
                    ));
                }
            }

            query.orderBy(cb.desc(root.get("createdAt")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
