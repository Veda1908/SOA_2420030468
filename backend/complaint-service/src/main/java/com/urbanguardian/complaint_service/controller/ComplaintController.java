package com.urbanguardian.complaint_service.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.urbanguardian.complaint_service.model.Complaint;
import com.urbanguardian.complaint_service.service.ComplaintService;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

        private final ComplaintService complaintService;

        private final Path uploadDirectory = Paths.get("uploads", "complaints")
                        .toAbsolutePath().normalize();

        public ComplaintController(ComplaintService complaintService) {
                this.complaintService = complaintService;
        }

        @PostMapping
        public ResponseEntity<Complaint> createComplaint(
                        @RequestBody Complaint complaint) {
                Complaint saved = complaintService.createComplaint(complaint);
                String token = complaintService.createPhotoUploadToken(saved.getId());
                return ResponseEntity.ok()
                                .header("X-Complaint-Upload-Token", token)
                                .header("Access-Control-Expose-Headers", "X-Complaint-Upload-Token")
                                .body(saved);
        }

        @GetMapping
        public ResponseEntity<List<Complaint>> getAllComplaints() {
                return ResponseEntity.ok(
                                complaintService.getAllComplaints());
        }

        @GetMapping("/dashboard")
        public ResponseEntity<Map<String, Long>> getDashboard() {
                return ResponseEntity.ok(
                                complaintService.getDashboardStats());
        }

        @GetMapping("/track/{complaintCode}")
        public ResponseEntity<Complaint> trackComplaint(
                        @PathVariable String complaintCode) {
                return complaintService.getComplaintByCode(complaintCode)
                                .map(ResponseEntity::ok)
                                .orElse(ResponseEntity.notFound().build());
        }

        @GetMapping("/{id}")
        public ResponseEntity<Complaint> getComplaintById(
                        @PathVariable Long id) {
                return complaintService.getComplaintById(id)
                                .map(ResponseEntity::ok)
                                .orElse(ResponseEntity.notFound().build());
        }

        @PutMapping("/{id}/status")
        public ResponseEntity<?> updateStatus(
                        @PathVariable Long id,
                        @RequestBody Map<String, String> request) {

                String status = request.get("status");

                if (status == null ||
                                !Set.of("SUBMITTED", "IN_PROGRESS", "RESOLVED")
                                                .contains(status)) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("error", "Invalid complaint status"));
                }

                return complaintService.updateStatus(id, status)
                                .<ResponseEntity<?>>map(ResponseEntity::ok)
                                .orElse(ResponseEntity.notFound().build());
        }

        // Upload one photo for an existing complaint
        @PostMapping(value = "/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<?> uploadPhoto(
                        @PathVariable Long id,
                        @RequestParam("file") MultipartFile file,
                        @RequestHeader(value = "X-Complaint-Upload-Token", required = false) String uploadToken) {

                if (complaintService.getComplaintById(id).isEmpty()) {
                        return ResponseEntity.notFound().build();
                }

                if (!complaintService.isValidPhotoUploadToken(id, uploadToken)) {
                        return ResponseEntity.status(403)
                                        .body(Map.of("error", "Invalid or already used upload token"));
                }

                if (file.isEmpty() || file.getSize() > 5 * 1024 * 1024) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("error", "Photo must be 5 MB or smaller"));
                }

                String extension;

                if (MediaType.IMAGE_JPEG_VALUE.equals(file.getContentType())) {
                        extension = ".jpg";
                } else if (MediaType.IMAGE_PNG_VALUE.equals(file.getContentType())) {
                        extension = ".png";
                } else {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("error", "Only JPG and PNG photos allowed"));
                }

                try {
                        Files.createDirectories(uploadDirectory);

                        // One photo per complaint, with a unique filename
                        String filename = id + "-" + UUID.randomUUID() + extension;
                        Path destination = uploadDirectory.resolve(filename);

                        Files.copy(file.getInputStream(), destination);

                        String photoUrl = "/api/complaints/" + id
                                        + "/photo/" + filename;

                        Complaint saved = complaintService
                                        .saveCitizenPhoto(id, photoUrl, uploadToken)
                                        .orElse(null);
                        if (saved == null) {
                                Files.deleteIfExists(destination);
                                return ResponseEntity.status(403)
                                                .body(Map.of("error", "Invalid or already used upload token"));
                        }

                        return ResponseEntity.ok(Map.of(
                                        "message", "Photo uploaded successfully",
                                        "photoUrl", saved.getPhotoUrl()));

                } catch (IOException error) {
                        return ResponseEntity.internalServerError()
                                        .body(Map.of("error", "Unable to save photo"));
                }
        }

        // Retrieve a saved complaint photo
        @GetMapping("/{id}/photo/{filename}")
        public ResponseEntity<Resource> getPhoto(
                        @PathVariable Long id,
                        @PathVariable String filename) {

                if (complaintService.getComplaintById(id).isEmpty()
                                || !filename.matches(
                                                java.util.regex.Pattern.quote(id.toString())
                                                                + "-[0-9a-fA-F-]{36}\\.(jpg|png)")) {
                        return ResponseEntity.notFound().build();
                }

                try {
                        Path photoPath = uploadDirectory.resolve(filename).normalize();

                        if (!photoPath.startsWith(uploadDirectory)
                                        || !Files.isRegularFile(photoPath)) {
                                return ResponseEntity.notFound().build();
                        }

                        Resource resource = new UrlResource(photoPath.toUri());

                        MediaType type = filename.endsWith(".png")
                                        ? MediaType.IMAGE_PNG
                                        : MediaType.IMAGE_JPEG;

                        return ResponseEntity.ok()
                                        .contentType(type)
                                        .header(HttpHeaders.CACHE_CONTROL, "no-store")
                                        .body(resource);

                } catch (Exception error) {
                        return ResponseEntity.notFound().build();
                }
        }
}
