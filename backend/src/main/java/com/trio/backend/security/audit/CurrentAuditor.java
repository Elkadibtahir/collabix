package com.trio.backend.security.audit;

import com.trio.backend.util.SecurityUtils;
import org.springframework.data.domain.AuditorAware;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class CurrentAuditor implements AuditorAware<UUID> {

    @Override
    public Optional<UUID> getCurrentAuditor() {
        try {
            return Optional.of(SecurityUtils.getCurrentUserId());
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}