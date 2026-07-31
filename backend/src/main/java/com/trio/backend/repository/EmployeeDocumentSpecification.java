package com.trio.backend.repository;

import com.trio.backend.dto.hr.EmployeeDocumentSearchCriteria;
import com.trio.backend.entity.EmployeeDocument;
import com.trio.backend.enums.DocumentStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class EmployeeDocumentSpecification {

    public static Specification<EmployeeDocument> withFilter(EmployeeDocumentSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("status"), DocumentStatus.ACTIVE));

            if (criteria != null) {
                if (criteria.getEmployeeId() != null) {
                    predicates.add(cb.equal(root.get("employee").get("id"), criteria.getEmployeeId()));
                }
                if (criteria.getDocumentType() != null) {
                    predicates.add(cb.equal(root.get("documentType"), criteria.getDocumentType()));
                }
                if (criteria.getStatus() != null) {
                    predicates.add(cb.equal(root.get("status"), criteria.getStatus()));
                }
                if (criteria.getVerified() != null) {
                    predicates.add(cb.equal(root.get("verified"), criteria.getVerified()));
                }
                if (criteria.getUploadedBy() != null) {
                    predicates.add(cb.equal(root.get("uploadedBy"), criteria.getUploadedBy()));
                }
                if (criteria.getExpirationFrom() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("expirationDate"), criteria.getExpirationFrom()));
                }
                if (criteria.getExpirationTo() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("expirationDate"), criteria.getExpirationTo()));
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
                            cb.like(cb.lower(root.get("originalFileName")), pattern),
                            cb.like(cb.lower(root.get("description")), pattern)
                    ));
                }
            }

            query.orderBy(cb.desc(root.get("createdAt")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
