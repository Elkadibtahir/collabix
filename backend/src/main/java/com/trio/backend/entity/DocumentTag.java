package com.trio.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "document_tags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DocumentTag {

    @EmbeddedId
    private DocumentTagId id;

    @MapsId("documentId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @MapsId("tagId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id", nullable = false)
    private Tag tag;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentTagId implements Serializable {

        @Column(name = "document_id")
        private UUID documentId;

        @Column(name = "tag_id")
        private UUID tagId;
    }
}
