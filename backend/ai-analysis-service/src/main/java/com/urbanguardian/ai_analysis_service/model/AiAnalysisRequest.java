package com.urbanguardian.ai_analysis_service.model;

public class AiAnalysisRequest {

    private String description;
    private String location;

    public AiAnalysisRequest() {
    }

    public AiAnalysisRequest(String description, String location) {
        this.description = description;
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}