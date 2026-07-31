package com.trio.backend.mapper;

import com.trio.backend.config.MapStructConfig;
import com.trio.backend.dto.permission.PermissionResponse;
import com.trio.backend.entity.Permission;
import org.mapstruct.Mapper;

@Mapper(config = MapStructConfig.class)
public interface PermissionMapper {

    PermissionResponse toResponse(Permission permission);

}