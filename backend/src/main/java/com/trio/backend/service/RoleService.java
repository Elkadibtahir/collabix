package com.trio.backend.service;

import com.trio.backend.dto.role.RoleResponse;

import java.util.List;
import java.util.UUID;

public interface RoleService {

    RoleResponse findById(UUID id);

    List<RoleResponse> findAll();

}