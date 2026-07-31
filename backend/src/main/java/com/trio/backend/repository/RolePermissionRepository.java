package com.trio.backend.repository;

import com.trio.backend.entity.Role;
import com.trio.backend.entity.RolePermission;
import com.trio.backend.entity.ids.RolePermissionId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RolePermissionRepository extends JpaRepository<RolePermission, RolePermissionId> {

    List<RolePermission> findAllByRole(Role role);

}