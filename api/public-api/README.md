# Digital Battery Passport Public API

A public proxy API for the Digital Battery Passport specification. This API forwards requests to the registered Back Office API (bo-api), allowing public consumers to access battery passport data without direct database access.

## Architecture

```
Client Requests
      ↓
   [Public API]
      ↓ (proxies with bo-api credentials)
   [Back Office API]
      ↓
   [MongoDB Database]
```

The public-api acts as a **reverse proxy/gateway**:
- Receives requests from public clients with public API key
- Validates public API key authentication
- Forwards authenticated requests to bo-api using bo-api credentials
- Returns responses to clients

This architecture provides:
- **Security**: Clients never access bo-api directly
- **Separation of Concerns**: Public API key is different from backend API key
- **Flexibility**: Configuration determines which bo-api instance to proxy to

## Features

- **Proxy Architecture**: Forwards requests to bo-api backend
- **API Key Authentication**: Validates requests using x-api-key header
- **Type-Safe**: Full TypeScript implementation with complete type definitions
- **CORS Enabled**: Supports cross-origin requests
- **Health Check**: `/health` endpoint for monitoring (no auth required)
- **Error Handling**: Proper HTTP status codes and error messages
- **Gateway Resilience**: Handles backend unavailability gracefully

## Setup

### Installation

```bash
npm install
```

### Configuration

Edit `config.yaml`:
```yaml
port: 3003
apiKey: demo-public-api-key              # Public API key that clients use
boApiUrl: http://localhost:3002          # Back Office API endpoint
boApiKey: demo-bo-api-key                # Back Office API key
```

### Build

```bash
npm run build
```

### Start

Production:
```bash
npm start
```

Development (with hot reload):
```bash
npm run dev
```

## API Endpoints

All endpoints require `x-api-key` header (except `/health`).

### Health & Status
- `GET /health` - Health check (no authentication required)
  - Returns: `{ "status": "ok" }`

### Battery Passport Operations

#### Read Operations (GET)
- `GET /bo/dbp/:resourceId` - Get complete battery passport
- `GET /bo/dbp/:resourceId/performance` - Get battery performance metrics
- `GET /bo/dbp/:resourceId/maintenance` - Get maintenance history
- `GET /bo/dbp/:resourceId/dynamic-updates` - Get dynamic status updates

#### Write Operations (POST)
- `POST /bo/dbp/` - Create or update a battery passport
- `POST /bo/dbp/:resourceId/performance` - Update performance metrics
- `POST /bo/dbp/:resourceId/maintenance` - Add a maintenance event

### Tier Routes (Backward Compatibility)
These routes proxy to corresponding tier variants on bo-api:
- `GET /bo/dbp/t2/:resourceId` - Tier 2 passport retrieval
- `GET /bo/dbp/t2/:resourceId/performance` - Tier 2 performance
- `POST /bo/dbp/t2/:resourceId/performance` - Tier 2 performance update
- `GET /bo/dbp/t2/:resourceId/maintenance` - Tier 2 maintenance
- `POST /bo/dbp/t2/:resourceId/maintenance` - Tier 2 add maintenance
- `GET /bo/dbp/t2/:resourceId/dynamic-updates` - Tier 2 dynamic updates

- `GET /bo/dbp/t3/:resourceId` - Tier 3 passport retrieval
- `GET /bo/dbp/t3/:resourceId/performance` - Tier 3 performance
- `POST /bo/dbp/t3/:resourceId/performance` - Tier 3 performance update
- `GET /bo/dbp/t3/:resourceId/maintenance` - Tier 3 maintenance
- `POST /bo/dbp/t3/:resourceId/maintenance` - Tier 3 add maintenance
- `GET /bo/dbp/t3/:resourceId/dynamic-updates` - Tier 3 dynamic updates

## Request Examples

### Health Check
```bash
curl http://localhost:3003/health
```

### Get Battery Passport
```bash
curl -H "x-api-key: demo-public-api-key" \
  http://localhost:3003/bo/dbp/battery-001
```

### Get Performance Metrics
```bash
curl -H "x-api-key: demo-public-api-key" \
  http://localhost:3003/bo/dbp/battery-001/performance
```

### Get Maintenance History
```bash
curl -H "x-api-key: demo-public-api-key" \
  http://localhost:3003/bo/dbp/battery-001/maintenance
```

### Get Dynamic Updates
```bash
curl -H "x-api-key: demo-public-api-key" \
  http://localhost:3003/bo/dbp/battery-001/dynamic-updates
```

### Update Performance
```bash
curl -X POST \
  -H "x-api-key: demo-public-api-key" \
  -H "Content-Type: application/json" \
  -d @performance.json \
  http://localhost:3003/bo/dbp/battery-001/performance
```

### Add Maintenance Event
```bash
curl -X POST \
  -H "x-api-key: demo-public-api-key" \
  -H "Content-Type: application/json" \
  -d @maintenance.json \
  http://localhost:3003/bo/dbp/battery-001/maintenance
```

## Response Examples

### Battery Passport (GET /bo/dbp/:resourceId)
```json
{
  "generalProductInformation": {
    "productIdentifier": "battery-001",
    "manufacturerInformation": { "identifier": "ACME-BATTERY-001" },
    "batteryMass": 353.5,
    "batteryCategory": "12V automotive",
    "manufacturingDate": "2024-01-15",
    "puttingIntoService": "2024-02-20",
    "warrantyPeriod": "3 years"
  },
  "performance": { ... },
  "maintenanceInformation": [ ... ],
  "dynamicUpdates": [ ... ],
  ...
}
```

### Dynamic Updates (GET /bo/dbp/:resourceId/dynamic-updates)
```json
[
  {
    "lastUpdate": "2026-01-05T08:00:00Z",
    "generalProductInformation": {
      "batteryStatus": "active",
      "operatorInformation": { "identifier": "ACME-OPS-001" }
    },
    "performance": { ... }
  },
  ...
]
```

## Error Handling

The API returns standard HTTP status codes:

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | OK | Data retrieved successfully |
| 201 | Created | Resource created/updated |
| 400 | Bad Request | Invalid request body |
| 401 | Unauthorized | Missing or invalid API key |
| 404 | Not Found | Resource doesn't exist |
| 502 | Bad Gateway | Cannot reach bo-api |
| 5xx | Server Error | Internal error |

Error Response Format:
```json
{
  "error": "NotFound",
  "message": "Resource not found"
}
```

## Security Considerations

1. **API Key Validation**: All non-health endpoints require a valid `x-api-key` header
2. **Separate Credentials**: Public API uses different key than backend bo-api
3. **No Database Access**: Clients interact only through proxy, not directly with database
4. **CORS Enabled**: Configured for all origins (customize in production)
5. **Backend Credential Isolation**: bo-api key is only known to public-api server

### Production Recommendations

- Use strong, randomly generated API keys
- Rotate API keys regularly
- Restrict CORS to specific allowed origins
- Use HTTPS in production
- Implement rate limiting if needed
- Add request logging and monitoring
- Use environment variables for sensitive config (don't commit config.yaml)

## Data Model

The API uses TypeScript types for full type safety. Key types:

- `DigitalBatteryPassport` - Complete battery passport document
- `Performance` - Battery performance and technical properties
- `MaintenanceInformationItem` - Maintenance event record
- `DynamicUpdate` - Real-time battery status update
- `MaterialComposition` - Battery chemistry and materials
- `Circularity` - Recyclability and circular economy info
- `SupplyChainDueDiligence` - Supply chain information
- `CarbonFootprint` - Lifecycle carbon footprint data

See `src/types.ts` for complete type definitions.

## Monitoring

The health endpoint can be used for monitoring:
```bash
curl http://localhost:3003/health
# Returns: {"status":"ok"}
```

Monitor these in production:
- Health endpoint availability
- Request latency
- Error rate
- API key validation failures
- Backend connectivity

## Troubleshooting

### Gateway Error (502)
- Check if bo-api is running on configured URL
- Verify `boApiUrl` in config.yaml
- Check network connectivity between public-api and bo-api

### Unauthorized (401)
- Verify `x-api-key` header is present
- Check that key matches `apiKey` in config.yaml
- Try without auth on `/health` endpoint to confirm server is responding

### Not Found (404)
- Verify `:resourceId` parameter exists in database
- Check endpoint path is correct
- Try getting `/health` to confirm server is responding

### Type Errors in TypeScript
- Run `npm run build` to check compilation
- All types are defined in `src/types.ts`
- Use `tsc --strict` for stricter type checking

