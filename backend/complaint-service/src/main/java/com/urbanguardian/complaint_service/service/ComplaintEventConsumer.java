
package com.urbanguardian.complaint_service.service;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class ComplaintEventConsumer {

    @KafkaListener(topics = "urbanguardian.complaints", groupId = "urbanguardian-escalation")
    public void consume(String event) {

        String[] parts = event.split("\\|", 3);

        if (parts.length != 3) {
            System.err.println(
                    "INVALID KAFKA EVENT: " + event);
            return;
        }

        String type = parts[0];
        String code = parts[1];
        String value = parts[2];

        System.out.println("KAFKA RECEIVED: " + event);

        if ("COMPLAINT_CREATED".equals(type)
                && "CRITICAL".equalsIgnoreCase(value)) {

            System.out.println(
                    "CRITICAL COMPLAINT ALERT: " + code);
        }

        if ("COMPLAINT_ESCALATED".equals(type)) {

            System.out.println(
                    "KAFKA ESCALATION NOTIFICATION: " + code);
        }

        if ("COMPLAINT_STATUS_UPDATED".equals(type)) {

            System.out.println(
                    "COMPLAINT STATUS CHANGED: "
                            + code + " -> " + value);
        }
    }
}
