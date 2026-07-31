package com.trio.backend.ai.repository;

import com.trio.backend.ai.entity.AIPrompt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AIPromptRepository extends JpaRepository<AIPrompt, UUID> {

    Optional<AIPrompt> findByCode(String code);

    boolean existsByCode(String code);
}
