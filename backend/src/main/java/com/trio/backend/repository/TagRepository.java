package com.trio.backend.repository;

import com.trio.backend.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TagRepository extends JpaRepository<Tag, UUID> {

    Optional<Tag> findByNameAndWorkspace_Id(String name, UUID workspaceId);

    boolean existsByNameAndWorkspace_Id(String name, UUID workspaceId);
}
