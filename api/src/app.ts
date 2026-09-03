node dist/serverimport express, { type NextFunction, type Request, type Response } from 'express';
import { API_KEY, boRegistration, passports } from './data';
import type { BORegistration, DigitalBatteryPassport, Performance } from './types';
import { apiError, notFound } from './utils';
import fs from 'fs';
import path from 'path';

const app = express();

app.use(express.json({ limit: '1mb' }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const providedApiKey =
    req.header('x-api-key') ??
    req.header('X-API-Key') ??
    (req.header('authorization')?.startsWith('Bearer ') ? req.header('authorization')?.replace(/^Bearer\s+/i, '') : undefined) ??
    (typeof req.query.apiKey === 'string' ? req.query.apiKey : undefined);

  if (!providedApiKey || providedApiKey !== API_KEY) {
    return apiError(res, 401, 'Unauthorized', 'A valid api-key is required.');
  }

  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Digital Battery Passport API' });
});

// Returns all available product identifiers (resource IDs)
app.get('/dbp', (_req, res) => {
  res.json(Array.from(passports.keys()));
});

function getPassport(resourceId: string): DigitalBatteryPassport | undefined {
  return passports.get(resourceId);
}

app.get('/dbp/:resourceId', (req, res) => {
  const passport = getPassport(req.params.resourceId);
  if (!passport) return notFound(res, `Battery passport '${req.params.resourceId}' was not found.`);
  res.json(passport);
});

app.get('/dbp/:resourceId/dynamicdata', (req, res) => {
  const passport = getPassport(req.params.resourceId);
  if (!passport) return notFound(res, `Battery passport '${req.params.resourceId}' was not found.`);
  res.json(passport.dynamicUpdates ?? []);
});

app.get('/dbp/:resourceId/performance', (req, res) => {
  const passport = getPassport(req.params.resourceId);
  if (!passport) return notFound(res, `Battery passport '${req.params.resourceId}' was not found.`);
  res.json(passport.performance);
});

app.get('/dbp/:resourceId/maintenance', (req, res) => {
  const passport = getPassport(req.params.resourceId);
  if (!passport) return notFound(res, `Battery passport '${req.params.resourceId}' was not found.`);
  res.json(passport.maintenanceInformation);
});

app.post('/dbp/:resourceId/maintenance', (req, res) => {
  const passport = getPassport(req.params.resourceId);
  if (!passport) return notFound(res, `Battery passport '${req.params.resourceId}' was not found.`);

  const incoming = Array.isArray(req.body) ? req.body : [req.body];
  if (!incoming.length) {
    return apiError(res, 400, 'BadRequest', 'Maintenance payload is required.');
  }

  passport.maintenanceInformation = [...passport.maintenanceInformation, ...incoming];
  res.status(201).json({ status: 'registered successfully', resourceId: req.params.resourceId });
});

app.get('/bo/register', (_req, res) => {
  res.json(boRegistration);
});

app.post('/bo/register', (req, res) => {
  if (!req.body || !req.body.boURL) {
    return apiError(res, 400, 'BadRequest', 'boURL is required.');
  }

  Object.assign(boRegistration, req.body);
  res.status(201).json({ status: 'registered successfully' });
});

app.post('/bo/dbp', (req, res) => {
  const body = req.body as Partial<DigitalBatteryPassport>;
  if (!body || !body.generalProductInformation || !body.performance) {
    return apiError(res, 400, 'BadRequest', 'A valid DigitalBatteryPassport payload is required.');
  }

  const resourceId =
    String((body.generalProductInformation as Record<string, unknown>).productIdentifier ?? `dbp-${Date.now()}`);

  passports.set(resourceId, body as DigitalBatteryPassport);
  res.status(201).json({ DBPId: resourceId });
});

app.get('/bo/dbp', (_req, res) => {
  const passport = passports.get('battery-001') ?? Object.values(passports)[0];
  if (!passport) return notFound(res, 'No battery passports are available.');
  res.json(passport);
});

app.get('/bo/dbp/t2', (_req, res) => {
  const passport = passports.get('battery-002') ?? Object.values(passports)[0];
  res.json(passport ?? {});
});

app.get('/bo/dbp/t2/:resourceId/performance', (req, res) => {
  const passport = getPassport(req.params.resourceId) ?? passports.get('battery-002');
  if (!passport) return notFound(res, `Battery passport '${req.params.resourceId}' was not found.`);
  res.json(passport.performance);
});

app.post('/bo/dbp/t2/:resourceId/performance', (req, res) => {
  const passport = getPassport(req.params.resourceId) ?? passports.get('battery-002');
  if (!passport) return notFound(res, `Battery passport '${req.params.resourceId}' was not found.`);

  passport.performance = req.body as Performance;
  res.status(201).json(passport.performance);
});

app.get('/bo/dbp/t2/:resourceId/maintenance', (req, res) => {
  const passport = getPassport(req.params.resourceId) ?? passports.get('battery-002');
  if (!passport) return notFound(res, `Battery passport '${req.params.resourceId}' was not found.`);
  res.json(passport.maintenanceInformation);
});

app.post('/bo/dbp/t2/:resourceId/maintenance', (req, res) => {
  const passport = getPassport(req.params.resourceId) ?? passports.get('battery-002');
  if (!passport) return notFound(res, `Battery passport '${req.params.resourceId}' was not found.`);

  const incoming = Array.isArray(req.body) ? req.body : [req.body];
  if (!incoming.length) {
    return apiError(res, 400, 'BadRequest', 'Maintenance payload is required.');
  }

  passport.maintenanceInformation = [...passport.maintenanceInformation, ...incoming];
  res.status(201).json({ status: 'registered successfully' });
});

app.get('/bo/dbp/t3', (_req, res) => {
  const passport = passports.get('battery-003') ?? Object.values(passports)[0];
  res.json(passport ?? {});
});

// Serve OpenAPI specification (YAML)
app.get('/openapi.yaml', (_req, res) => {
  try {
    const yamlPath = path.join(process.cwd(), 'OpenAPI', 'swagger', 'full_spec', 'openapi.yaml');
    const content = fs.readFileSync(yamlPath, 'utf8');
    res.type('application/yaml').send(content);
  } catch (err) {
    notFound(res, 'OpenAPI YAML specification not found.');
  }
});

// Serve OpenAPI specification (JSON) if available
app.get('/openapi.json', (_req, res) => {
  try {
    const jsonPath = path.join(process.cwd(), 'OpenAPI', 'swagger', 'full_spec', 'modification.json');
    const content = fs.readFileSync(jsonPath, 'utf8');
    res.type('application/json').send(JSON.parse(content));
  } catch (err) {
    notFound(res, 'OpenAPI JSON specification not found.');
  }
});

app.use((req, res) => {
  notFound(res, `Endpoint '${req.method} ${req.originalUrl}' was not found.`);
});

export default app;
