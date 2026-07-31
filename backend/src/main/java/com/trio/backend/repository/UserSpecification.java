package com.trio.backend.repository;

import com.trio.backend.dto.user.UserSearchCriteria;
import com.trio.backend.entity.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class UserSpecification {

    public static Specification<User> withCriteria(UserSearchCriteria criteria, UUID workspaceId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            query.distinct(true);

            Join<Object, Object> workspaceMemberJoin = root.join("workspaceMembers", JoinType.INNER);
            predicates.add(cb.equal(workspaceMemberJoin.get("workspace").get("id"), workspaceId));

            if (criteria.getKeyword() != null && !criteria.getKeyword().isBlank()) {
                String pattern = "%" + criteria.getKeyword().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("firstName")), pattern),
                        cb.like(cb.lower(root.get("lastName")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern)
                ));
            }

            if (criteria.getFirstName() != null && !criteria.getFirstName().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("firstName")), "%" + criteria.getFirstName().toLowerCase() + "%"));
            }

            if (criteria.getLastName() != null && !criteria.getLastName().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("lastName")), "%" + criteria.getLastName().toLowerCase() + "%"));
            }

            if (criteria.getEmail() != null && !criteria.getEmail().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("email")), "%" + criteria.getEmail().toLowerCase() + "%"));
            }

            if (criteria.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), criteria.getStatus()));
            }

            if (criteria.getStatuses() != null && !criteria.getStatuses().isEmpty()) {
                predicates.add(root.get("status").in(criteria.getStatuses()));
            }

            if (criteria.getRole() != null) {
                Join<Object, Object> userRoleJoin = root.join("userRoles", JoinType.INNER);
                Join<Object, Object> roleJoin = userRoleJoin.join("role", JoinType.INNER);
                predicates.add(cb.equal(roleJoin.get("name"), criteria.getRole()));
            }

            if (criteria.getDepartmentId() != null) {
                predicates.add(cb.equal(root.get("primaryDepartment").get("id"), criteria.getDepartmentId()));
            }

            if (criteria.getTeamId() != null) {
                Join<Object, Object> teamMemberJoin = root.join("teamMembers", JoinType.INNER);
                predicates.add(cb.equal(teamMemberJoin.get("team").get("id"), criteria.getTeamId()));
            }

            if (criteria.getMemberType() != null) {
                predicates.add(cb.equal(root.get("memberType"), criteria.getMemberType()));
            }

            if (criteria.getCreatedAfter() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), criteria.getCreatedAfter()));
            }

            if (criteria.getCreatedBefore() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), criteria.getCreatedBefore()));
            }

            if (criteria.getLastLoginAfter() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("lastLoginAt"), criteria.getLastLoginAfter()));
            }

            if (criteria.getLastLoginBefore() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("lastLoginAt"), criteria.getLastLoginBefore()));
            }

            if (criteria.isExcludeSoftDeleted()) {
                predicates.add(cb.notEqual(root.get("status"), com.trio.backend.enums.UserStatus.SOFT_DELETED));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

}
