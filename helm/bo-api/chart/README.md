BO API configuration mount

The generated Secret contains a `config.yaml` key. Its volume mount uses
`mountPath: /app/config.yaml` and `subPath: config.yaml` to mount that single
file rather than a directory. Preserve `subPath` when overriding
`api.volumeMounts` in custom values files.

The rendered configuration uses the case-sensitive `apiKey` field required
by the BO API; set its value through `api.config.apikey`.
Configuration changes trigger a Deployment rollout through `checksum/config`.
Secret files mounted with `subPath` are not updated in running containers.

Legacy chart documentation below:

Federated API & Distribution Orchestrator (DO) Helm chart

What this chart does

This chart deploys two related components:
- `api`: the Federated API service (Spring-based) that exposes the node's REST interfaces, handles events and talks to a triplestore.
- `do`: the Distribution Orchestrator (Python-based) responsible for delivery/dip interactions and distribution flows.

Both are configured from this chart and share some global settings.

Values (top-level keys in values.yaml)

- podAnnotations: map of annotations applied to Pods.
- podLabels: map of labels applied to Pods.

- global:
  - replicaCount: global default replica count.
  - nameOverride / fullnameOverride: override chart names.
  - imagePullSecrets: list of image pull secrets.
  - database: host/port/name/user/password for shared DB (if used).
  - orchestrator.apikey: API key the orchestrator uses to contact the WEB API and vice versa.
  - security.apikey: shared security API key.
  - edc.identity: EDC identity DID for the components.

- api:
  - image.repository / tag / pullPolicy: container image details for the API.
  - ingress: ingress enablement, hosts, annotations and TLS settings.
  - service.type / port: service type and port.
  - env: extra environment variables for the API Pod (list form).
  - volumes / volumeMounts: secrets or other volumes to mount into the API Pod.
  - config: nested API-specific configuration (federated.node.version, orchestrator.server host/apikey, CORS, event types, graphdb/triplestore settings, security settings, server port).
  - yamlConfig.enabled: if true, load configuration from mounted YAML.

- do:
  - image.repository / tag / pullPolicy: container image details for the DO service.
  - ingress: ingress settings for the DO component.
  - env: environment variables for DO (e.g., PYC_CONFIG location).
  - volumes / volumeMounts: secrets or other volumes to mount into the DO Pod.
  - config: DO-specific configuration (identity, interfaces for agent/dip, security users/apiKeys, api host/port/workers, delivery/purge settings).
  - service.type / port: service type and port for DO.
  - yamlConfig.enabled: toggle DO to load config from YAML.

How to use

- Edit values.yaml to set images, secrets, database and the nested api/do config values to match your environment.
- If using secrets for config, ensure the referenced secret names (e.g., federated-api-config, federated-do-config) exist in the target namespace.
- Enable ingresses and set hostnames/TLS when exposing services externally.

For any nested key not documented here, refer to values.yaml for defaults and to the chart templates for how each value is consumed.