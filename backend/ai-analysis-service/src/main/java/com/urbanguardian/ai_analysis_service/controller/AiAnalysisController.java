package com.urbanguardian.ai_analysis_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.urbanguardian.ai_analysis_service.model.AiAnalysisRequest;
import com.urbanguardian.ai_analysis_service.model.AiAnalysisResponse;
import com.urbanguardian.ai_analysis_service.service.AiAnalysisService;

@RestController
@RequestMapping("/api/ai")
public class AiAnalysisController {

    private final AiAnalysisService aiAnalysisService;

    public AiAnalysisController(AiAnalysisService aiAnalysisService) {
        this.aiAnalysisService = aiAnalysisService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<AiAnalysisResponse> analyzeComplaint(
            @RequestBody AiAnalysisRequest request) {

        AiAnalysisResponse response =
                aiAnalysisService.analyzeComplaint(request);

        return ResponseEntity.ok(response);
    }
}