package com.trio.backend.service;

import com.trio.backend.dto.permission.PermissionResponse;

import java.util.List;
import java.util.UUID;

public interface PermissionService {

    PermissionResponse findById(UUID id);

    List<PermissionResponse> findAll();

}