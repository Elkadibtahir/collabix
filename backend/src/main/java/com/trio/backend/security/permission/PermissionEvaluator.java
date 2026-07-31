package com.trio.backend.security.permission;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Component("permissionEvaluator")
public class PermissionEvaluator {

    public boolean hasPermission(Authentication authentication, String permissionCode) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.debug("Permission check failed: not authenticated");
            return false;
        }

        boolean granted = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(permissionCode::equals);

        if (!granted) {
            log.debug("Permission '{}' denied for user", permissionCode);
        }

        return granted;
    }

    public boolean hasAnyPermission(Authentication authentication, String... permissionCodes) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Set<String> required = Set.of(permissionCodes);
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(required::contains);
    }

    public boolean hasAllPermissions(Authentication authentication, String... permissionCodes) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Set<String> userPermissions = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        return Arrays.stream(permissionCodes).allMatch(userPermissions::contains);
    }
}
