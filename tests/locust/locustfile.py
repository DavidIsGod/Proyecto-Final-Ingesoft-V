from locust import HttpUser, task, between


class AuthUser(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def health(self):
        self.client.get("/actuator/health")

    @task(1)
    def login(self):
        self.client.post(
            "/api/v1/auth/login",
            json={"username": "admin", "password": "admin123"},
        )


class PromotionUser(HttpUser):
    host = "http://localhost:8088"
    wait_time = between(1, 2)

    @task
    def health_stats(self):
        self.client.get("/api/v1/health-status/stats")
