package com.trio.backend.service;

import com.trio.backend.dto.permission.PermissionResponse;
import com.trio.backend.entity.Permission;
import com.trio.backend.exception.ResourceNotFoundException;
import com.trio.backend.mapper.PermissionMapper;
import com.trio.backend.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Implementation of the service management des permissions.
 *
 * <p>Cette class centralise la logical mÃ©tier relatede aux permissions
 * availables dans la plateforme Collabix.</p>
 *
 * <p>Les permissions sont des givens de rÃ©fÃ©rence (READ, CREATE,
 * UPDATE, DELETE, etc.) initializedes par les migrations Flyway et
 * associated aux roles via l'entity RolePermission.</p>
 *
 * <p><strong>Responsibilitys :</strong></p>
 * <ul>
 *     <li>Resorteve une permission par its identifier.</li>
 *     <li>Resorteve the list de all permissions.</li>
 * </ul>
 *
 * <p>Cette Implementation s'appuie sur :</p>
 * <ul>
 *     <li>{@link PermissionRepository} for access aux givens.</li>
 *     <li>{@link PermissionMapper} pour conversion Entity â†’ DTO.</li>
 * </ul>
 *
 * All operations sont executed en lecture seule.
 *
 * @see PermissionService
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PermissionServiceImpl implements PermissionService {

    /**
     * Repository allowstant l'accÃ¨s aux permissions.
     */
    private final PermissionRepository permissionRepository;

    /**
     * Mapper de conversion Entity â†’ DTO.
     */
    private final PermissionMapper permissionMapper;

    /**
     * Recherche une permission par its identifier.
     *
     * @param id identifiant of the permission
     * @return the permission correspondssinge
     * @throws ResourceNotFoundException si the permission does not exist
     */
    @Override
    public PermissionResponse findById(UUID id) {

        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Permission not found."));

        return permissionMapper.toResponse(permission);
    }

    /**
     * Returns the list de all permissions availables.
     *
     * @return list of permissions
     */
    @Override
    @Cacheable(value = "permissions")
    public List<PermissionResponse> findAll() {

        return permissionRepository.findAll()
                .stream()
                .map(permissionMapper::toResponse)
                .toList();
    }

}
