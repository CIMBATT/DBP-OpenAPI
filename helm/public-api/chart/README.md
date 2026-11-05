# CIMBATT Public API Helm chart

Deploys the public-api proxy using a Deployment, Service, configuration Secret
and optional Ingress. Requires Kubernetes 1.19 or newer.

From the project root:

```powershell
helm upgrade --install public-api .\DBP-OpenAPI\helm\public-pi\chart -f .\public-api-values.yaml
```

Create a deployment-specific `public-api-values.yaml` with the image tag,
credentials and backend URL appropriate for your environment. Do not commit
real credentials. For example:

```yaml
global:
  imagePullSecrets:
    - name: registry-pull-secret
api:
  image:
    tag: "1.0.0"
  config:
    apiKey: "replace-public-api-key"
    boApiUrl: "http://bo-api-bo-api:8080"
    boApiKey: "replace-with-bo-api-key"
```

`boApiUrl` defaults to the BO API Service for release `bo-api` in the same
namespace. Adjust the Service name and port for your BO API deployment;
use its fully qualified Service DNS name when it is in another namespace.
`boApiKey` must match that backend's configured API key.

The Service listens on `api.service.port` (8080) and forwards to
`api.config.port` (3003) inside the container. Enable `api.ingress.enabled`
and configure its hosts, class, annotations and TLS to expose the Service.
Ingress routes to the public-api Service, not the backend BO API.

The Secret mounts its `config.yaml` key at `/app/config.yaml` using `subPath`.
A configuration checksum triggers a rollout on config changes; a running
container's subPath mount does not receive Secret updates automatically.
Readiness and liveness probes use the unauthenticated `/health` endpoint.
No MongoDB is deployed: the public API forwards requests to the BO API.
