
package com.urbanguardian.complaint_service.client;

import java.time.Duration;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@Component
public class AiAnalysisClient {

        private final RestClient restClient;

        public AiAnalysisClient(RestClient.Builder restClientBuilder) {

                SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();

                factory.setConnectTimeout(Duration.ofSeconds(5));
                factory.setReadTimeout(Duration.ofSeconds(30));

                this.restClient = restClientBuilder
                                .baseUrl("http://127.0.0.1:8002")
                                .requestFactory(factory)
                                .build();
        }

        public AiAnalysisResult analyzeComplaint(
                        String description, String location) {

                Map<String, String> request = Map.of(
                                "description", description,
                                "location", location);

                return restClient.post()
                                .uri("/analyze")
                                .body(request)
                                .retrieve()
                                .body(AiAnalysisResult.class);
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        public record AiAnalysisResult(
                        String category,
                        String priority,
                        String department,

                        @JsonProperty("reasoning") String reason,

                        String summary,

                        @JsonProperty("suggested_action") String suggestedAction,

                        @JsonProperty("needs_human_review") boolean needsHumanReview) {
        }
}
