
package com.urbanguardian.complaint_service.service;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class ComplaintEventProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;

    public ComplaintEventProducer(
            KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publish(String eventType,
            String complaintCode,
            String value) {

        String event = eventType + "|"
                + complaintCode + "|" + value;

        kafkaTemplate.send(
                "urbanguardian.complaints",
                complaintCode,
                event).whenComplete((result, error) -> {

                    if (error != null) {
                        System.err.println(
                                "KAFKA PUBLISH FAILED: "
                                        + error.getMessage());
                    } else {
                        System.out.println(
                                "KAFKA PUBLISHED: " + event);
                    }
                });
    }
}
