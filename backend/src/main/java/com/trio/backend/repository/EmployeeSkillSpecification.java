package com.trio.backend.repository;

import com.trio.backend.dto.hr.EmployeeSkillSearchCriteria;
import com.trio.backend.entity.EmployeeSkill;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class EmployeeSkillSpecification {

    public static Specification<EmployeeSkill> withFilter(EmployeeSkillSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (criteria != null) {
                if (criteria.getEmployeeId() != null) {
                    predicates.add(cb.equal(root.get("employee").get("id"), criteria.getEmployeeId()));
                }
                if (criteria.getCategory() != null) {
                    predicates.add(cb.equal(root.get("category"), criteria.getCategory()));
                }
                if (criteria.getProficiencyLevel() != null) {
                    predicates.add(cb.equal(root.get("proficiencyLevel"), criteria.getProficiencyLevel()));
                }
                if (criteria.getVerified() != null) {
                    predicates.add(cb.equal(root.get("verified"), criteria.getVerified()));
                }
                if (criteria.getActive() != null) {
                    predicates.add(cb.equal(root.get("active"), criteria.getActive()));
                }
                if (criteria.getHasCertification() != null) {
                    if (criteria.getHasCertification()) {
                        predicates.add(cb.isNotNull(root.get("certificationName")));
                    } else {
                        predicates.add(cb.isNull(root.get("certificationName")));
                    }
                }
                if (criteria.getCertificationExpiringBefore() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("certificationExpiration"), criteria.getCertificationExpiringBefore()));
                }
                if (criteria.getKeyword() != null && !criteria.getKeyword().isBlank()) {
                    String pattern = "%" + criteria.getKeyword().toLowerCase() + "%";
                    predicates.add(cb.or(
                            cb.like(cb.lower(root.get("skillName")), pattern),
                            cb.like(cb.lower(root.get("certificationName")), pattern),
                            cb.like(cb.lower(root.get("notes")), pattern)
                    ));
                }
            }

            query.orderBy(cb.desc(root.get("createdAt")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
