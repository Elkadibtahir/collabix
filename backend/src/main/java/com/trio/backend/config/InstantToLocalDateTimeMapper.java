package com.trio.backend.config;

import org.mapstruct.Named;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * Helper class for MapStruct time conversions.
 */
public final class InstantToLocalDateTimeMapper {

    private InstantToLocalDateTimeMapper() {
    }

//    @Named("instantToLocalDateTime")
    public static LocalDateTime instantToLocalDateTime(Instant instant) {
        if (instant == null) {
            return null;
        }
        return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
    }
}

