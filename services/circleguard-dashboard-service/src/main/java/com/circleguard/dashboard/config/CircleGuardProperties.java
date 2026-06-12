package com.circleguard.dashboard.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "circleguard")
public class CircleGuardProperties {
    private PromotionService promotionService = new PromotionService();
    private Features features = new Features();

    @Data
    public static class PromotionService {
        private String url = "http://localhost:8088";
    }

    @Data
    public static class Features {
        private boolean analyticsEnabled = true;
    }
}
