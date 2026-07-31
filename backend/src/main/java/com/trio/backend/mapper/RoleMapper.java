package com.trio.backend.mapper;

import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.role.RoleResponse;
import com.trio.backend.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Collections;
import java.util.List;

@Mapper(config = MapStructConfig.class)
public interface RoleMapper {

    @Mapping(target = "permissions", expression = "java(mapPermissions(role))")
    @Mapping(target = "userCount", ignore = true)
    RoleResponse toResponse(Role role);

    default List<String> mapPermissions(Role role) {
        if (role.getRolePermissions() == null) return Collections.emptyList();
        return role.getRolePermissions().stream()
                .map(rp -> rp.getPermission().getCode())
                .sorted()
                .toList();
    }

}