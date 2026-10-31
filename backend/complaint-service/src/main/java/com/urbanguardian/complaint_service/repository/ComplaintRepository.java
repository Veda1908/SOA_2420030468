
package com.urbanguardian.complaint_service.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.urbanguardian.complaint_service.model.Complaint;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    Optional<Complaint> findByComplaintCode(String complaintCode);

    long countByStatus(String status);

    long countByEscalatedTrue();

    List<Complaint> findByStatusAndCreatedAtBefore(
            String status, LocalDateTime cutoff);
}
