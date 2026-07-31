package com.trio.backend.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager manager = new SimpleCacheManager();
        manager.setCaches(List.of(
                cache("dashboard.workspace", 5, 100),
                cache("dashboard.personal", 2, 500),
                cache("dashboard.department", 5, 200),
                cache("dashboard.team", 5, 200),
                cache("dashboard.project", 5, 200),
                cache("permissions", 30, 50),
                cache("roles", 30, 50),
                cache("reference.departments", 10, 200),
                cache("reference.teams", 10, 200),
                cache("ai.prompts", 15, 100),
                cache("ai.models", 15, 100)
        ));
        return manager;
    }

    private static CaffeineCache cache(String name, int ttlMinutes, int maxSize) {
        return new CaffeineCache(name, Caffeine.newBuilder()
                .expireAfterWrite(ttlMinutes, TimeUnit.MINUTES)
                .maximumSize(maxSize)
                .build());
    }
}
