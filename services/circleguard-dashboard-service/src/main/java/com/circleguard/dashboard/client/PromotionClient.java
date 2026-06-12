package com.circleguard.dashboard.client;

import com.circleguard.dashboard.config.CircleGuardProperties;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Component
@Slf4j
@RequiredArgsConstructor
public class PromotionClient {

    private final CircleGuardProperties properties;
    private final RestTemplate restTemplate = new RestTemplate();

    @CircuitBreaker(name = "promotionClient", fallbackMethod = "healthStatsFallback")
    @SuppressWarnings("unchecked")
    public Map<String, Object> getHealthStats() {
        return restTemplate.getForObject(
                properties.getPromotionService().getUrl() + "/api/v1/health-status/stats",
                Map.class
        );
    }

    @CircuitBreaker(name = "promotionClient", fallbackMethod = "departmentStatsFallback")
    @SuppressWarnings("unchecked")
    public Map<String, Object> getHealthStatsByDepartment(String department) {
        return restTemplate.getForObject(
                properties.getPromotionService().getUrl() + "/api/v1/health-status/stats/department/" + department,
                Map.class
        );
    }

    @SuppressWarnings("unused")
    private Map<String, Object> healthStatsFallback(Exception e) {
        log.error("Circuit breaker open for promotion-service stats", e);
        return Map.of("error", "Service unavailable", "timestamp", new Date());
    }

    @SuppressWarnings("unused")
    private Map<String, Object> departmentStatsFallback(String department, Exception e) {
        log.error("Circuit breaker open for promotion-service department stats", e);
        return Map.of("error", "Service unavailable", "department", department, "timestamp", new Date());
    }
}
