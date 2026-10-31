
package com.urbanguardian.ai_analysis_service.service;

import org.springframework.stereotype.Service;

import com.urbanguardian.ai_analysis_service.model.AiAnalysisRequest;
import com.urbanguardian.ai_analysis_service.model.AiAnalysisResponse;

@Service
public class AiAnalysisService {

    public AiAnalysisResponse analyzeComplaint(AiAnalysisRequest request) {

        String description = request.getDescription() == null
                ? ""
                : request.getDescription().toLowerCase()
                    .replaceAll("[^a-z0-9 ]", " ")
                    .replaceAll("\\s+", " ")
                    .trim();

        String category = "GENERAL";
        String priority = "MEDIUM";
        String department = "Municipal Administration";
        String reason = "The complaint requires manual review.";

        // 1. Emergency detection (highest precedence)

        if (matches(description,
                "fire", "flames", "building burning",
                "house burning", "smoke coming",
                "gas leak", "gas leakage", "lpg leak",
                "gas cylinder blast", "explosion",
                "blast", "short circuit fire")) {

            category = "FIRE_EMERGENCY";
            priority = "CRITICAL";
            department = "Fire and Emergency Services";
            reason = "Potential fire, gas leakage or explosion hazard detected. "
                    + "Immediate emergency attention is recommended.";

        } else if (matches(description,
                "electric shock", "electrocution",
                "live wire", "exposed wire",
                "fallen electric pole", "transformer blast",
                "sparking transformer")) {

            category = "ELECTRICAL_HAZARD";
            priority = "CRITICAL";
            department = "Electricity Department";
            reason = "A potentially life-threatening electrical hazard was detected.";

        } else if (matches(description,
                "building collapse", "collapsed building",
                "wall collapse", "bridge collapse",
                "trapped people", "trapped inside")) {

            category = "STRUCTURAL_EMERGENCY";
            priority = "CRITICAL";
            department = "Disaster Management Department";
            reason = "Possible structural collapse or rescue emergency detected.";

        // 2. Public safety

        } else if (matches(description,
                "road accident", "vehicle accident",
                "serious accident", "hit and run",
                "injured person", "people injured",
                "accident on road")) {

            category = "ROAD_SAFETY";
            priority = "CRITICAL";
            department = "Traffic Police and Emergency Services";
            reason = "A road accident or immediate public safety risk was reported.";

        } else if (matches(description,
                "flood", "flooding", "heavy waterlogging",
                "water logged", "waterlogged",
                "submerged road")) {

            category = "FLOODING";
            priority = "HIGH";
            department = "Disaster Management Department";
            reason = "Flooding or severe waterlogging may affect public safety.";

        // 3. Sanitation and drainage

        } else if (matches(description,
                "sewage", "sewer", "drainage",
                "drain overflow", "blocked drain",
                "open manhole", "manhole overflow")) {

            category = "DRAINAGE";
            priority = matches(description,
                    "overflow", "open manhole",
                    "sewage leak", "blocked")
                    ? "HIGH" : "MEDIUM";
            department = "Drainage and Sewerage Department";
            reason = "A drainage or sewerage problem was detected.";

        } else if (matches(description,
                "garbage", "trash", "waste",
                "dumping", "rubbish", "unclean street",
                "uncollected garbage")) {

            category = "SANITATION";
            priority = matches(description,
                    "hospital waste", "medical waste",
                    "toxic waste", "hazardous waste")
                    ? "HIGH" : "MEDIUM";
            department = "Sanitation Department";
            reason = "The complaint concerns waste collection or public sanitation.";

        // 4. Water supply

        } else if (matches(description,
                "water leakage", "water leak",
                "pipe burst", "broken pipeline",
                "water pipe", "water supply",
                "no drinking water", "no water",
                "tap water", "water contamination",
                "contaminated water")) {

            category = "WATER_SUPPLY";
            priority = matches(description,
                    "contaminated", "pipe burst",
                    "no drinking water", "dirty drinking water")
                    ? "HIGH" : "MEDIUM";
            department = "Water Works Department";
            reason = "The complaint indicates a water supply, leakage or quality issue.";

        // 5. Roads and transport

        } else if (matches(description,
                "pothole", "damaged road",
                "road damaged", "broken road",
                "road crack", "bad road",
                "road repair", "road damage")) {

            category = "ROADS";
            priority = "HIGH";
            department = "Road Maintenance Department";
            reason = "Damaged road infrastructure may create traffic and safety risks.";

        } else if (matches(description,
                "traffic jam", "traffic congestion",
                "illegal parking", "traffic signal",
                "signal not working", "traffic light")) {

            category = "TRAFFIC";
            priority = "MEDIUM";
            department = "Traffic Management Department";
            reason = "A traffic management or road congestion issue was detected.";

        // 6. Street lighting

        } else if (matches(description,
                "streetlight", "street light",
                "street lamp", "dark street",
                "light not working", "broken streetlight")) {

            category = "STREET_LIGHTING";
            priority = "MEDIUM";
            department = "Electrical Department";
            reason = "The complaint indicates a public street lighting problem.";

        // 7. Public health

        } else if (matches(description,
                "mosquito", "mosquito breeding",
                "dengue", "malaria", "disease outbreak",
                "stray dog", "dog attack", "animal bite")) {

            category = "PUBLIC_HEALTH";
            priority = matches(description,
                    "outbreak", "dog attack",
                    "animal bite", "dengue")
                    ? "HIGH" : "MEDIUM";
            department = "Public Health Department";
            reason = "A public health or community safety concern was identified.";

        // 8. Environmental complaints

        } else if (matches(description,
                "air pollution", "noise pollution",
                "industrial smoke", "chemical waste",
                "illegal dumping", "polluted lake",
                "factory pollution")) {

            category = "ENVIRONMENT";
            priority = "HIGH";
            department = "Environmental Protection Department";
            reason = "The complaint indicates a possible environmental hazard.";
        }

        // 9. Context-aware severity adjustment

        // Escalate HIGH issues to CRITICAL when immediate danger is explicit.
        if ("HIGH".equals(priority)
                && matches(description,
                    "life threatening",
                    "people trapped",
                    "multiple injuries",
                    "immediate danger",
                    "fatal accident")) {

            priority = "CRITICAL";
            reason += " Immediate danger indicators increase urgency.";
        }

        // Increase MEDIUM issues when severe conditions are described.
        if ("MEDIUM".equals(priority)
                && !"GENERAL".equals(category)
                && matches(description,
                    "severe", "dangerous",
                    "major", "urgent",
                    "for many days")) {

            priority = "HIGH";
            reason += " Severity indicators increase priority.";
        }

        return new AiAnalysisResponse(
                category,
                priority,
                department,
                reason
        );
    }

    // Match complete words or phrases, not partial words.
    private boolean matches(String description, String... keywords) {

        String paddedDescription = " " + description + " ";

        for (String keyword : keywords) {
            if (paddedDescription.contains(" " + keyword + " ")) {
                return true;
            }
        }

        return false;
    }
}
