package com.circleguard.auth.client;

import com.circleguard.auth.config.CircleGuardProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Component
@RequiredArgsConstructor
public class IdentityClient {
    private final RestTemplate restTemplate = new RestTemplate();
    private final CircleGuardProperties properties;

    public UUID getAnonymousId(String realIdentity) {
        String url = properties.getIdentityService().getUrl() + "/api/v1/identities/map";
        Map<String, String> request = Map.of("realIdentity", realIdentity);
        Map<?, ?> response = restTemplate.postForObject(url, request, Map.class);
        return UUID.fromString(response.get("anonymousId").toString());
    }
}
