package com.trio.backend.storage;

import org.springframework.core.io.Resource;

public interface StorageService {

    String store(byte[] content, String originalFilename, String contentType);

    Resource loadAsResource(String storagePath);

    byte[] loadContent(String storagePath);

    String getContentType(String storagePath);

    void delete(String storagePath);
}
