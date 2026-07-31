package com.trio.backend.repository;

import com.trio.backend.dto.hr.AttendanceSearchCriteria;
import com.trio.backend.entity.Attendance;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class AttendanceSpecification {

    public static Specification<Attendance> withFilter(UUID departmentId, AttendanceSearchCriteria criteria) {
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
                if (criteria.getDateFrom() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("date"), criteria.getDateFrom()));
                }
                if (criteria.getDateTo() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("date"), criteria.getDateTo()));
                }
                if (criteria.getMonth() != null && criteria.getYear() != null) {
                    int month = criteria.getMonth();
                    int year = criteria.getYear();
                    predicates.add(cb.between(root.get("date"),
                            LocalDate.of(year, month, 1),
                            LocalDate.of(year, month, 1).plusMonths(1).minusDays(1)));
                } else if (criteria.getMonth() != null) {
                    int month = criteria.getMonth();
                    int year = LocalDate.now().getYear();
                    predicates.add(cb.between(root.get("date"),
                            LocalDate.of(year, month, 1),
                            LocalDate.of(year, month, 1).plusMonths(1).minusDays(1)));
                } else if (criteria.getYear() != null) {
                    int year = criteria.getYear();
                    predicates.add(cb.between(root.get("date"),
                            LocalDate.of(year, 1, 1),
                            LocalDate.of(year, 12, 31)));
                }
                if (criteria.getCreatedBy() != null) {
                    predicates.add(cb.equal(root.get("createdBy"), criteria.getCreatedBy()));
                }
                if (criteria.getKeyword() != null && !criteria.getKeyword().isBlank()) {
                    String pattern = "%" + criteria.getKeyword().toLowerCase() + "%";
                    predicates.add(cb.like(cb.lower(root.get("notes")), pattern));
                }
            }

            query.orderBy(cb.desc(root.get("date")), cb.desc(root.get("createdAt")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
