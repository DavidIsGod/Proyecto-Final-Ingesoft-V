package com.circleguard.dashboard.client;

import com.github.tomakehurst.wiremock.junit5.WireMockExtension;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.util.Map;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = "spring.config.import=optional:classpath:actuator.yml")
class PromotionClientCircuitBreakerTest {

    @RegisterExtension
    static WireMockExtension wireMock = WireMockExtension.newInstance()
            .options(wireMockConfig().dynamicPort())
            .build();

    @DynamicPropertySource
    static void configure(DynamicPropertyRegistry registry) {
        registry.add("circleguard.promotion-service.url",
                () -> "http://localhost:" + wireMock.getPort());
    }

    @Autowired
    private PromotionClient client;

    @Test
    void returnsStatsWhenServiceAvailable() {
        wireMock.stubFor(get(urlEqualTo("/api/v1/health-status/stats"))
                .willReturn(okJson("{\"confirmed\":2}")));

        Map<String, Object> result = client.getHealthStats();

        assertThat(result).containsEntry("confirmed", 2);
    }

    @Test
    void usesFallbackWhenServiceFails() {
        wireMock.stubFor(get(urlEqualTo("/api/v1/health-status/stats"))
                .willReturn(serverError()));

        Map<String, Object> result = client.getHealthStats();

        assertThat(result).containsKey("error");
    }
}
