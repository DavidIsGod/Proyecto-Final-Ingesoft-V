package com.circleguard.promotion.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;

@Component
public class PromotionMetrics {
    private final Counter promotionsTotal;

    public PromotionMetrics(MeterRegistry registry) {
        this.promotionsTotal = Counter.builder("circleguard.promotions.total")
                .description("Total health status promotions")
                .register(registry);
    }

    public void recordPromotion() {
        promotionsTotal.increment();
    }
}
