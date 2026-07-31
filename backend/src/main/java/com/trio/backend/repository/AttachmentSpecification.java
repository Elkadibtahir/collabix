package com.trio.backend.repository;

import com.trio.backend.dto.hr.AttachmentSearchCriteria;
import com.trio.backend.entity.CandidateAttachment;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class AttachmentSpecification {

    public static Specification<CandidateAttachment> withFilter(UUID departmentId, AttachmentSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("candidate").get("department").get("id"), departmentId));

            if (criteria != null) {
                if (criteria.getCandidateId() != null) {
                    predicates.add(cb.equal(root.get("candidate").get("id"), criteria.getCandidateId()));
                }
                if (criteria.getAttachmentType() != null) {
                    predicates.add(cb.equal(root.get("attachmentType"), criteria.getAttachmentType()));
                }
                if (criteria.getUploadedBy() != null) {
                    predicates.add(cb.equal(root.get("uploadedBy"), criteria.getUploadedBy()));
                }
                if (criteria.getFileExtension() != null) {
                    predicates.add(cb.equal(root.get("fileExtension"), criteria.getFileExtension()));
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
