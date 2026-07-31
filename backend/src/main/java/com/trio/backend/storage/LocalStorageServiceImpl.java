package com.trio.backend.storage;

import com.trio.backend.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class LocalStorageServiceImpl implements StorageService {

    private final Path uploadDir;

    public LocalStorageServiceImpl(@Value("${app.storage.local.path:./uploads}") String uploadDirPath) {
        this.uploadDir = Paths.get(uploadDirPath).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadDir, e);
        }
    }

    @Override
    public String store(byte[] content, String originalFilename, String contentType) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String storedName = UUID.randomUUID() + extension;
        Path targetPath = uploadDir.resolve(storedName);

        try {
            Files.write(targetPath, content);
        } catch (IOException e) {
            throw new BadRequestException("Failed to store file: " + originalFilename);
        }

        return storedName;
    }

    @Override
    public Resource loadAsResource(String storagePath) {
        Path file = uploadDir.resolve(storagePath).normalize();
        if (!file.startsWith(uploadDir)) {
            throw new BadRequestException("Invalid storage path.");
        }
        if (!Files.exists(file)) {
            throw new BadRequestException("File not found: " + storagePath);
        }
        return new PathResource(file);
    }

    @Override
    public byte[] loadContent(String storagePath) {
        Path file = uploadDir.resolve(storagePath).normalize();
        if (!file.startsWith(uploadDir)) {
            throw new BadRequestException("Invalid storage path.");
        }
        try {
            return Files.readAllBytes(file);
        } catch (IOException e) {
            throw new BadRequestException("Failed to read file: " + storagePath);
        }
    }

    @Override
    public String getContentType(String storagePath) {
        Path file = uploadDir.resolve(storagePath).normalize();
        try {
            String contentType = Files.probeContentType(file);
            return contentType != null ? contentType : "application/octet-stream";
        } catch (IOException e) {
            return "application/octet-stream";
        }
    }

    @Override
    public void delete(String storagePath) {
        Path file = uploadDir.resolve(storagePath).normalize();
        if (!file.startsWith(uploadDir)) {
            throw new BadRequestException("Invalid storage path.");
        }
        try {
            Files.deleteIfExists(file);
        } catch (IOException e) {
            throw new BadRequestException("Failed to delete file: " + storagePath);
        }
    }

}
