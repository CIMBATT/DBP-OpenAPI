import express, { type NextFunction, type Request, type Response } from 'express';
import axios, { type AxiosError } from 'axios';
import { config } from './config';
import { apiError, notFound } from './utils';
import type {
  CreateDigitalBatteryPassportResponse,
  DigitalBatteryPassport,
  MaintenanceInformationItem,
  Performance,
} from './types';

const app = express();
app.use(express.json({ limit: '1mb' }));

// Store the registered bo-api URL
let registeredBoApiUrl: string | null = null;

// Logging middleware - log all incoming requests
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}${req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''}`);
  next();
});

const API_KEY = config.apiKey;

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-api-key, authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const readApiKey = (req: Request) =>
  req.header('x-api-key') ?? req.header('X-API-Key') ?? req.header('authorization')?.replace(/^Bearer\s+/i, '');

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET' && req.path === '/health') return next();
  if (readApiKey(req) !== API_KEY) return apiError(res, 401, 'Unauthorized', 'provided API key is not valid');
  next();
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const currentApiBaseUrl = (req: Request) => `${req.protocol}://${req.get('host')}`;

app.post('/bo/register', async (req, res) => {
  const payload = req.body as Partial<{ boURL: string }>;
  if (!payload?.boURL) {
    return apiError(res, 400, 'BadRequest', 'boURL is required.');
  }
  registeredBoApiUrl = payload.boURL.replace(/\/$/, '');
  console.log(`Back-office API registered: ${registeredBoApiUrl}`);
  res.status(201).json({ status: 'registered successfully' });
});

const proxyRequest = async (
  method: string,
  path: string,
  data?: unknown,
  headers?: Record<string, string>,
) => {
  if (!registeredBoApiUrl) {
    return {
      status: 503,
      data: { error: 'ServiceUnavailable', message: 'An admin must register a back-office API first.' },
    };
  }
  try {
    const url = `${registeredBoApiUrl}${path}`;
    console.log(`Proxying ${method} ${path} to ${url}`);
    const response = await axios({
      method,
      url,
      data,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.boApiKey,
        ...headers,
      },
      validateStatus: () => true,
    });
    return { status: response.status, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return {
      status: axiosError.response?.status || 502,
      data: { error: 'GatewayError', message: 'Failed to reach backend service' },
    };
  }
};

app.post('/dbp/', async (req, res) => {
  const result = await proxyRequest('POST', '/bo/dbp/', req.body);
  res.status(result.status).json(result.data);
});

app.get('/dbp/', async (req, res) => {
  const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
  const path = queryString ? `/bo/dbp/?${queryString}` : '/bo/dbp/';
  const result = await proxyRequest('GET', path);
  res.status(result.status).json(result.data);
});

app.get('/dbp/:resourceId', async (req, res) => {
  const result = await proxyRequest('GET', `/bo/dbp/${req.params.resourceId}`);
  res.status(result.status).json(result.data);
});

app.get('/dbp/:resourceId/performance', async (req, res) => {
  const result = await proxyRequest('GET', `/bo/dbp/${req.params.resourceId}/performance`);
  res.status(result.status).json(result.data);
});

app.post('/dbp/:resourceId/performance', async (req, res) => {
  const result = await proxyRequest('POST', `/bo/dbp/${req.params.resourceId}/performance`, req.body);
  res.status(result.status).json(result.data);
});

app.get('/dbp/:resourceId/maintenance', async (req, res) => {
  const result = await proxyRequest('GET', `/bo/dbp/${req.params.resourceId}/maintenance`);
  res.status(result.status).json(result.data);
});

app.post('/dbp/:resourceId/maintenance', async (req, res) => {
  const result = await proxyRequest('POST', `/bo/dbp/${req.params.resourceId}/maintenance`, req.body);
  res.status(result.status).json(result.data);
});

app.get('/dbp/:resourceId/dynamic-updates', async (req, res) => {
  const result = await proxyRequest('GET', `/bo/dbp/${req.params.resourceId}/dynamic-updates`);
  res.status(result.status).json(result.data);
});

// Tier 2 routes
app.get('/dbp/t2/:resourceId', async (req, res) => {
  const result = await proxyRequest('GET', `/bo/dbp/t2/${req.params.resourceId}`);
  res.status(result.status).json(result.data);
});

app.get('/dbp/t2/:resourceId/performance', async (req, res) => {
  const result = await proxyRequest('GET', `/bo/dbp/t2/${req.params.resourceId}/performance`);
  res.status(result.status).json(result.data);
});

app.post('/dbp/t2/:resourceId/performance', async (req, res) => {
  const result = await proxyRequest('POST', `/bo/dbp/t2/${req.params.resourceId}/performance`, req.body);
  res.status(result.status).json(result.data);
});

app.get('/dbp/t2/:resourceId/maintenance', async (req, res) => {
  const result = await proxyRequest('GET', `/bo/dbp/t2/${req.params.resourceId}/maintenance`);
  res.status(result.status).json(result.data);
});

app.post('/dbp/t2/:resourceId/maintenance', async (req, res) => {
  const result = await proxyRequest('POST', `/bo/dbp/t2/${req.params.resourceId}/maintenance`, req.body);
  res.status(result.status).json(result.data);
});

app.get('/dbp/t2/:resourceId/dynamic-updates', async (req, res) => {
  const result = await proxyRequest('GET', `/bo/dbp/t2/${req.params.resourceId}/dynamic-updates`);
  res.status(result.status).json(result.data);
});

// Tier 3 routes
app.get('/dbp/t3/:resourceId', async (req, res) => {
  const result = await proxyRequest('GET', `/bo/dbp/t3/${req.params.resourceId}`);
  res.status(result.status).json(result.data);
});

app.get('/dbp/t3/:resourceId/performance', async (req, res) => {
  const result = await proxyRequest('GET', `/bo/dbp/t3/${req.params.resourceId}/performance`);
  res.status(result.status).json(result.data);
});

app.post('/dbp/t3/:resourceId/performance', async (req, res) => {
  const result = await proxyRequest('POST', `/bo/dbp/t3/${req.params.resourceId}/performance`, req.body);
  res.status(result.status).json(result.data);
});

app.get('/dbp/t3/:resourceId/maintenance', async (req, res) => {
  const result = await proxyRequest('GET', `/bo/dbp/t3/${req.params.resourceId}/maintenance`);
  res.status(result.status).json(result.data);
});

app.post('/dbp/t3/:resourceId/maintenance', async (req, res) => {
  const result = await proxyRequest('POST', `/bo/dbp/t3/${req.params.resourceId}/maintenance`, req.body);
  res.status(result.status).json(result.data);
});

app.get('/dbp/t3/:resourceId/dynamic-updates', async (req, res) => {
  const result = await proxyRequest('GET', `/bo/dbp/t3/${req.params.resourceId}/dynamic-updates`);
  res.status(result.status).json(result.data);
});

app.use((req, res) => notFound(res, `Endpoint '${req.method} ${req.originalUrl}' was not found.`));

export default app;
