package com.trio.backend.service;

import com.trio.backend.dto.role.RoleResponse;
import com.trio.backend.entity.Role;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.RoleMapper;
import com.trio.backend.repository.RoleRepository;
import com.trio.backend.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;
    private final UserRoleRepository userRoleRepository;

    @Override
    public RoleResponse findById(UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Role not found."));

        RoleResponse response = roleMapper.toResponse(role);
        response.setUserCount(userRoleRepository.countByRoleId(id));
        return response;
    }

    @Override
    @Cacheable(value = "roles")
    public List<RoleResponse> findAll() {
        return roleRepository.findAll()
                .stream()
                .map(roleMapper::toResponse)
                .map(response -> {
                    Role role = roleRepository.findById(response.getId()).orElse(null);
                    if (role != null) {
                        response.setUserCount(userRoleRepository.countByRoleId(response.getId()));
                    }
                    return response;
                })
                .toList();
    }

}