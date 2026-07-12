package com.trio.backend.security.audit;

import org.springframework.data.domain.AuditorAware;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class CurrentAuditor implements AuditorAware<UUID> {

    @Override
    public Optional<UUID> getCurrentAuditor() {

        // JWT pas encore implémenté
        return Optional.empty();
    }
}