package com.trio.backend.repository;

import com.trio.backend.entity.User;
import com.trio.backend.entity.UserRole;
import com.trio.backend.entity.ids.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {

    List<UserRole> findAllByUser(User user);

    void deleteAllByUser(User user);

    boolean existsByUser(User user);

    long countByRoleId(UUID roleId);

}