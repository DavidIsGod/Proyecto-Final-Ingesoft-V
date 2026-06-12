package com.circleguard.auth.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "circleguard")
public class CircleGuardProperties {
    private IdentityService identityService = new IdentityService();

    @Data
    public static class IdentityService {
        private String url = "http://localhost:8083";
    }
}
