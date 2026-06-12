# Locust — pruebas de carga

```bash
pip install locust
locust -f tests/locust/locustfile.py --host http://localhost:8180
```

Abrir http://localhost:8089 para la UI de Locust.

Para promotion en paralelo, usar la clase `PromotionUser` (host 8088) en un segundo proceso.
