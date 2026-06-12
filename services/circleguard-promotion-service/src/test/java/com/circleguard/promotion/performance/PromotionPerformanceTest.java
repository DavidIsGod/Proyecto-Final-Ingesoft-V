package com.circleguard.promotion.performance;

import com.circleguard.promotion.service.HealthStatusService;
import com.circleguard.promotion.support.AbstractPromotionIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.Neo4jContainer;
import org.testcontainers.junit.jupiter.Container;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class PromotionPerformanceTest extends AbstractPromotionIntegrationTest {

    @Container
    static Neo4jContainer<?> neo4jContainer = new Neo4jContainer<>("neo4j:5.12")
            .withAdminPassword("password");

    @DynamicPropertySource
    static void neo4jProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.neo4j.uri", neo4jContainer::getBoltUrl);
        registry.add("spring.neo4j.authentication.username", () -> "neo4j");
        registry.add("spring.neo4j.authentication.password", () -> "password");
    }

    @Autowired
    private HealthStatusService healthStatusService;

    @Autowired
    private Neo4jClient neo4jClient;

    private String rootUser;

    @BeforeEach
    void setupBenchmarkData() {
        neo4jClient.query("MATCH (n) DETACH DELETE n").run();

        rootUser = UUID.randomUUID().toString();

        neo4jClient.query("CREATE (:User {anonymousId: $id, status: 'ACTIVE'})")
                .bind(rootUser).to("id").run();

        neo4jClient.query("UNWIND range(1, 10000) as i " +
                "CREATE (u:User {anonymousId: 'user-' + toString(i), status: 'ACTIVE'})")
                .run();

        neo4jClient.query("MATCH (root:User {anonymousId: $id}), (others:User) " +
                "WHERE others.anonymousId <> $id " +
                "WITH root, others LIMIT 50 " +
                "CREATE (root)-[:ENCOUNTERED {startTime: timestamp()}]->(others)")
                .bind(rootUser).to("id")
                .run();

        neo4jClient.query("MATCH (u1:User), (u2:User) " +
                "WHERE u1.anonymousId <> u2.anonymousId AND rand() < 0.001 " +
                "WITH u1, u2 LIMIT 15000 " +
                "CREATE (u1)-[:ENCOUNTERED {startTime: timestamp()}]->(u2)")
                .run();
    }

    @Test
    void benchmarkPromotionPerformance() {
        String warmupUser = "user-1";
        healthStatusService.updateStatus(warmupUser, "CONFIRMED");

        long startTime = System.currentTimeMillis();
        healthStatusService.updateStatus(rootUser, "CONFIRMED");
        long duration = System.currentTimeMillis() - startTime;

        long maxMs = "true".equalsIgnoreCase(System.getenv("CI")) ? 5000 : 1000;
        assertTrue(duration < maxMs,
                "Promotion cascade exceeded target. Actual: " + duration + "ms, max: " + maxMs + "ms");

        Long suspectCount = neo4jClient.query("MATCH (root:User {anonymousId: $id})-[:ENCOUNTERED]-(c1:User) " +
                "WHERE c1.status = 'SUSPECT' RETURN count(c1) as count")
                .bind(rootUser).to("id")
                .fetchAs(Long.class).one().get();
        assertTrue(suspectCount > 0, "No L1 contacts were promoted to SUSPECT");

        Long probableCount = neo4jClient.query("MATCH (root:User {anonymousId: $id})-[:ENCOUNTERED]-(c1)-[:ENCOUNTERED]-(c2:User) " +
                "WHERE c2.status = 'PROBABLE' AND c2.anonymousId <> root.anonymousId RETURN count(c2) as count")
                .bind(rootUser).to("id")
                .fetchAs(Long.class).one().get();
        assertTrue(probableCount > 0, "No L2 contacts were promoted to PROBABLE");
    }
}
