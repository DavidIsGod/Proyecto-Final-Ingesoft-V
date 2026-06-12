package com.circleguard.auth.client;

import com.circleguard.auth.config.CircleGuardProperties;
import com.github.tomakehurst.wiremock.junit5.WireMockExtension;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;

import java.util.UUID;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
import static org.assertj.core.api.Assertions.assertThat;

class IdentityClientIntegrationTest {

    @RegisterExtension
    static WireMockExtension wireMock = WireMockExtension.newInstance()
            .options(wireMockConfig().dynamicPort())
            .build();

    private IdentityClient client;

    @BeforeEach
    void setUp() {
        CircleGuardProperties properties = new CircleGuardProperties();
        properties.getIdentityService().setUrl("http://localhost:" + wireMock.getPort());
        client = new IdentityClient(properties);
    }

    @Test
    void mapsIdentityToAnonymousId() {
        UUID expected = UUID.randomUUID();
        wireMock.stubFor(post(urlEqualTo("/api/v1/identities/map"))
                .willReturn(okJson("{\"anonymousId\":\"" + expected + "\"}")));

        UUID result = client.getAnonymousId("student@university.edu");

        assertThat(result).isEqualTo(expected);
    }
}
