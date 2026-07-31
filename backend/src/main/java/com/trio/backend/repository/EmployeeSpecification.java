package com.trio.backend.repository;

import com.trio.backend.dto.hr.EmployeeSearchCriteria;
import com.trio.backend.entity.Employee;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class EmployeeSpecification {

    public static Specification<Employee> withFilter(UUID departmentId, EmployeeSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("department").get("id"), departmentId));

            if (criteria != null) {
                if (criteria.getKeyword() != null && !criteria.getKeyword().isBlank()) {
                    String pattern = "%" + criteria.getKeyword().toLowerCase() + "%";
                    predicates.add(cb.or(
                            cb.like(cb.lower(root.get("firstName")), pattern),
                            cb.like(cb.lower(root.get("lastName")), pattern),
                            cb.like(cb.lower(root.get("email")), pattern),
                            cb.like(cb.lower(root.get("employeeNumber")), pattern),
                            cb.like(cb.lower(root.get("position")), pattern)
                    ));
                }
                if (criteria.getEmployeeNumber() != null && !criteria.getEmployeeNumber().isBlank()) {
                    predicates.add(cb.like(cb.lower(root.get("employeeNumber")), "%" + criteria.getEmployeeNumber().toLowerCase() + "%"));
                }
                if (criteria.getTeamId() != null) {
                    predicates.add(cb.equal(root.get("team").get("id"), criteria.getTeamId()));
                }
                if (criteria.getManagerId() != null) {
                    predicates.add(cb.equal(root.get("manager").get("id"), criteria.getManagerId()));
                }
                if (criteria.getPosition() != null && !criteria.getPosition().isBlank()) {
                    predicates.add(cb.like(cb.lower(root.get("position")), "%" + criteria.getPosition().toLowerCase() + "%"));
                }
                if (criteria.getStatus() != null) {
                    predicates.add(cb.equal(root.get("employmentStatus"), criteria.getStatus()));
                }
                if (criteria.getEmploymentType() != null) {
                    predicates.add(cb.equal(root.get("employmentType"), criteria.getEmploymentType()));
                }
                if (criteria.getStartDateFrom() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("startDate"), criteria.getStartDateFrom()));
                }
                if (criteria.getStartDateTo() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("startDate"), criteria.getStartDateTo()));
                }
            }

            query.orderBy(cb.desc(root.get("createdAt")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
