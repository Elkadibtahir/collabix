package com.trio.backend.repository;

import com.trio.backend.dto.ai.AIModelSearchCriteria;
import com.trio.backend.entity.AIModel;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class AIModelSpecification {

    public Specification<AIModel> withSearch(AIModelSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (criteria.getProjectId() != null) {
                predicates.add(cb.equal(root.get("project").get("id"), criteria.getProjectId()));
            }
            if (criteria.getTeamId() != null) {
                predicates.add(cb.equal(root.get("team").get("id"), criteria.getTeamId()));
            }
            if (criteria.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), criteria.getStatus()));
            }
            if (criteria.getModelType() != null) {
                predicates.add(cb.equal(root.get("modelType"), criteria.getModelType()));
            }
            if (criteria.getOwnerId() != null) {
                predicates.add(cb.equal(root.get("ownerId"), criteria.getOwnerId()));
            }
            if (criteria.getKeyword() != null && !criteria.getKeyword().isBlank()) {
                String pattern = "%" + criteria.getKeyword().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("name")), pattern));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
