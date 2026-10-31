package com.urbanguardian.complaint_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.urbanguardian.complaint_service.client.AiAnalysisClient;
import com.urbanguardian.complaint_service.model.Complaint;
import com.urbanguardian.complaint_service.repository.ComplaintRepository;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final AiAnalysisClient aiAnalysisClient;
    private final ComplaintEventProducer eventProducer;

    public ComplaintService(
            ComplaintRepository complaintRepository,
            AiAnalysisClient aiAnalysisClient,
            ComplaintEventProducer eventProducer) {

        this.complaintRepository = complaintRepository;
        this.aiAnalysisClient = aiAnalysisClient;
        this.eventProducer = eventProducer;
    }

    // Create complaint with Gemini AI and Kafka
    public Complaint createComplaint(Complaint complaint) {

        String complaintCode = "UG-" + UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();

        complaint.setComplaintCode(complaintCode);
        complaint.setStatus("SUBMITTED");
        complaint.setEscalated(false);

        try {
            AiAnalysisClient.AiAnalysisResult analysis = aiAnalysisClient.analyzeComplaint(
                    complaint.getDescription(),
                    complaint.getLocation());

            if (analysis != null) {

                complaint.setCategory(analysis.category());
                complaint.setPriority(analysis.priority());
                complaint.setDepartment(analysis.department());
                complaint.setAiReason(analysis.reason());
                complaint.setAiSummary(analysis.summary());
                complaint.setSuggestedAction(
                        analysis.suggestedAction());
                complaint.setNeedsHumanReview(
                        analysis.needsHumanReview());
            }

        } catch (Exception e) {

            complaint.setCategory("PENDING_ANALYSIS");
            complaint.setPriority("MEDIUM");
            complaint.setDepartment("Municipal Administration");

            complaint.setAiReason(
                    "AI analysis is temporarily unavailable. "
                            + "Complaint saved for later analysis.");

            complaint.setAiSummary(null);
            complaint.setSuggestedAction(null);
            complaint.setNeedsHumanReview(true);
        }

        Complaint saved = complaintRepository.save(complaint);

        // Publish event after successful database save
        eventProducer.publish(
                "COMPLAINT_CREATED",
                saved.getComplaintCode(),
                saved.getPriority());

        return saved;
    }

    // Get all complaints
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    // Get complaint by ID
    public Optional<Complaint> getComplaintById(Long id) {
        return complaintRepository.findById(id);
    }

    // Track complaint using code
    public Optional<Complaint> getComplaintByCode(String complaintCode) {
        return complaintRepository.findByComplaintCode(complaintCode);
    }

    // Update complaint status
    public Optional<Complaint> updateStatus(Long id, String status) {

        return complaintRepository.findById(id).map(complaint -> {

            complaint.setStatus(status);

            if ("IN_PROGRESS".equals(status)
                    || "RESOLVED".equals(status)) {

                complaint.setEscalated(false);
            }

            Complaint saved = complaintRepository.save(complaint);

            eventProducer.publish(
                    "COMPLAINT_STATUS_UPDATED",
                    saved.getComplaintCode(),
                    saved.getStatus());

            return saved;
        });
    }

    // Automatically escalate overdue complaints
    @Scheduled(fixedRate = 30000)
    public void autoEscalateComplaints() {

        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(2);

        List<Complaint> overdueComplaints = complaintRepository.findByStatusAndCreatedAtBefore(
                "SUBMITTED", cutoff);

        for (Complaint complaint : overdueComplaints) {

            if (!complaint.isEscalated()) {

                complaint.setEscalated(true);
                complaint.setStatus("ESCALATED");

                Complaint saved = complaintRepository.save(complaint);

                // Publish escalation event to Kafka
                eventProducer.publish(
                        "COMPLAINT_ESCALATED",
                        saved.getComplaintCode(),
                        "OVERDUE");

                System.out.println(
                        "ESCALATED: " + saved.getComplaintCode());
            }
        }
    }

    // Dashboard statistics
    public Map<String, Long> getDashboardStats() {

        return Map.of(
                "total", complaintRepository.count(),
                "submitted",
                complaintRepository.countByStatus("SUBMITTED"),
                "inProgress",
                complaintRepository.countByStatus("IN_PROGRESS"),
                "resolved",
                complaintRepository.countByStatus("RESOLVED"),
                "escalated",
                complaintRepository.countByEscalatedTrue());
    }

    // Save uploaded photo URL in PostgreSQL
    public Optional<Complaint> saveComplaintPhoto(
            Long id, String photoUrl) {

        return complaintRepository.findById(id)
                .map(complaint -> {
                    complaint.setPhotoUrl(photoUrl);
                    return complaintRepository.save(complaint);
                });
    }

    // One-time citizen upload capability. Only a hash is stored in the database.
    private String hashUploadToken(String token) {
        try {
            byte[] bytes = java.security.MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(bytes);
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    public String createPhotoUploadToken(Long complaintId) {
        String token = UUID.randomUUID().toString() + UUID.randomUUID().toString();
        Complaint complaint = complaintRepository.findById(complaintId).orElseThrow();
        complaint.setPhotoUploadTokenHash(hashUploadToken(token));
        complaintRepository.save(complaint);
        return token;
    }

    public boolean isValidPhotoUploadToken(Long id, String token) {
        if (token == null || token.isBlank())
            return false;
        return complaintRepository.findById(id)
                .filter(complaint -> complaint.getPhotoUrl() == null
                        && complaint.getPhotoUploadTokenHash() != null
                        && java.security.MessageDigest.isEqual(
                                complaint.getPhotoUploadTokenHash().getBytes(java.nio.charset.StandardCharsets.UTF_8),
                                hashUploadToken(token).getBytes(java.nio.charset.StandardCharsets.UTF_8)))
                .isPresent();
    }

    // A successful upload consumes the token so it cannot be reused.
    @org.springframework.transaction.annotation.Transactional
    public synchronized Optional<Complaint> saveCitizenPhoto(Long id, String photoUrl, String token) {
        if (token == null || token.isBlank())
            return Optional.empty();
        return complaintRepository.findById(id)
                .filter(complaint -> complaint.getPhotoUrl() == null
                        && complaint.getPhotoUploadTokenHash() != null
                        && java.security.MessageDigest.isEqual(
                                complaint.getPhotoUploadTokenHash().getBytes(java.nio.charset.StandardCharsets.UTF_8),
                                hashUploadToken(token).getBytes(java.nio.charset.StandardCharsets.UTF_8)))
                .map(complaint -> {
                    complaint.setPhotoUrl(photoUrl);
                    complaint.setPhotoUploadTokenHash(null);
                    return complaintRepository.save(complaint);
                });
    }
}
