package com.trio.backend.storage;

import com.trio.backend.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
public class FileValidationService {

    private static final Set<String> ALLOWED_MIME_TYPES = new HashSet<>(Arrays.asList(
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain", "text/csv",
            "application/json", "application/xml",
            "application/zip",
            "application/x-tar", "application/gzip"
    ));

    private static final Set<String> ALLOWED_EXTENSIONS = new HashSet<>(Arrays.asList(
            "jpg", "jpeg", "png", "gif", "webp", "svg",
            "pdf",
            "doc", "docx",
            "xls", "xlsx",
            "ppt", "pptx",
            "txt", "csv",
            "json", "xml",
            "zip", "tar", "gz"
    ));

    @Value("${app.storage.max-file-size:10485760}")
    private long maxFileSize;

    public void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required.");
        }

        if (file.getSize() > maxFileSize) {
            throw new BadRequestException(
                    "File size exceeds maximum allowed size of " + (maxFileSize / 1024 / 1024) + "MB."
            );
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            log.warn("Blocked file upload with disallowed MIME type: {}", contentType);
            throw new BadRequestException("File type is not allowed.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null) {
            String extension = "";
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex > 0) {
                extension = originalFilename.substring(dotIndex + 1).toLowerCase();
            }
            if (!extension.isEmpty() && !ALLOWED_EXTENSIONS.contains(extension)) {
                log.warn("Blocked file upload with disallowed extension: {}", extension);
                throw new BadRequestException("File extension is not allowed.");
            }
        }
    }

    public String sanitizeFilename(String originalFilename) {
        if (originalFilename == null) return UUID.randomUUID().toString();
        String sanitized = originalFilename
                .replaceAll("[^a-zA-Z0-9._-]", "_")
                .replaceAll("\\.\\.", "_");
        if (sanitized.length() > 255) {
            sanitized = sanitized.substring(0, 255);
        }
        return sanitized;
    }
}
