package com.urbanguardian.ai_analysis_service.model;

public class AiAnalysisResponse {

    private String category;
    private String priority;
    private String department;
    private String reason;

    public AiAnalysisResponse() {
    }

    public AiAnalysisResponse(String category,
                              String priority,
                              String department,
                              String reason) {
        this.category = category;
        this.priority = priority;
        this.department = department;
        this.reason = reason;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}