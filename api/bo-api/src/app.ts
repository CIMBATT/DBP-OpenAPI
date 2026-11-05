import express, { type NextFunction, type Request, type Response } from 'express';
import { API_KEY } from './data';
import { config } from './config';
import { connectMongo, passportsCollection } from './mongo';
import type {
  BORegisterRequest,
  CreateDigitalBatteryPassportResponse,
  DigitalBatteryPassport,
  MaintenanceInformationItem,
  Performance,
} from './types';
import { apiError, notFound } from './utils';
import { isDynamicUpdate, latestDynamicUpdate } from './dynamicUpdate';

const app = express();
app.use(express.json({ limit: '1mb' }));

// Logging middleware - log all incoming requests
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}${req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''}`);
  next();
});

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
  const payload = req.body as Partial<BORegisterRequest>;
  if (!payload?.publicURL) {
    return apiError(res, 400, 'BadRequest', 'publicURL is required.');
  }
  if (!payload?.apiKey) {
    return apiError(res, 400, 'BadRequest', 'apiKey is required.');
  }

  const response = await fetch(payload.publicURL.replace(/\/$/, '') + '/bo/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': payload.apiKey },
    body: JSON.stringify({
      apiKey: config.apiKey,
      oemName: config.oemName,
      boURL: currentApiBaseUrl(req),
    }),
  });

  if (!response.ok) {
    return apiError(res, response.status, 'UpstreamError', 'registration request failed.');
  }

  res.status(201).json({ status: 'registered successfully' });
});

const getPassport = async (id?: string): Promise<DigitalBatteryPassport | undefined> => {
  if (!id) return (await passportsCollection.findOne({}, { sort: { 'generalProductInformation.productIdentifier': 1 } })) ?? undefined;
  return (await passportsCollection.findOne({ 'generalProductInformation.productIdentifier': id } as never)) ?? undefined;
};

app.post('/bo/dbp/:id/update', async (req, res) => {
  const id = req.params.id;
  if (!config.bmsApiKey) {
    return apiError(res, 503, 'ConfigurationError', 'BMS API key is not configured (set BMS_API_KEY or bmsApiKey in config.yaml).');
  }
  try {
    await connectMongo();
    const passport = await getPassport(id);
    if (!passport) return notFound(res, `Battery passport '${id}' was not found.`);

    let updates: unknown;
    try {
      const url = new URL(`${config.bmsBaseUrl}/bms/${encodeURIComponent(id)}/performance/last`);
      const lastUpdatedAt = latestDynamicUpdate(passport.dynamicUpdates);
      if (lastUpdatedAt) url.searchParams.set('lastUpdatedAt', lastUpdatedAt);
      const response = await fetch(url.toString(), {
        headers: { 'x-api-key': config.bmsApiKey },
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) {
        return apiError(res, 502, 'UpstreamError', `BMS performance request failed with HTTP ${response.status}.`);
      }
      updates = await response.json();
      if (isDynamicUpdate(updates)) {
        updates = [updates];
      } else if (typeof updates === 'object' && updates !== null && !Array.isArray(updates) && Object.keys(updates).length === 0) {
        updates = [];
      }
    } catch (error) {
      console.error('BMS performance request failed:', error);
      return apiError(res, 502, 'UpstreamError', 'Unable to retrieve BMS performance updates.');
    }

    if (!Array.isArray(updates) || !updates.every(isDynamicUpdate)) {
      return apiError(res, 502, 'UpstreamError', 'BMS response must be an array of valid DynamicUpdate objects.');
    }
    if (updates.length > 0) {
      const latestTimestamp = latestDynamicUpdate(updates);
      const latestUpdate = updates.find((update) => update.lastUpdate === latestTimestamp);
      const result = await passportsCollection.updateOne(
        { 'generalProductInformation.productIdentifier': id },
        {
          $addToSet: { dynamicUpdates: { $each: updates } },
          ...(latestUpdate?.performance ? { $set: { performance: latestUpdate.performance } } : {}),
        },
      );
      if (result.matchedCount === 0) return notFound(res, `Battery passport '${id}' was not found.`);
    }
    res.json({ status: 'dynamic updates imported successfully', DBPId: id, count: updates.length });
  } catch (error) {
    console.error('Failed to store battery passport dynamic updates:', error);
    return apiError(res, 500, 'InternalServerError', 'Unable to store battery passport dynamic updates.');
  }
});

app.post('/bo/dbp/', async (req, res) => {
  const passport = req.body as DigitalBatteryPassport;
  if (!passport?.generalProductInformation?.productIdentifier) {
    return apiError(res, 400, 'BadRequest', 'A valid DigitalBatteryPassport payload is required.');
  }
  await connectMongo();
  await passportsCollection.replaceOne(
    { 'generalProductInformation.productIdentifier': passport.generalProductInformation.productIdentifier } as never,
    passport,
    { upsert: true },
  );
  const response: CreateDigitalBatteryPassportResponse = { DBPId: passport.generalProductInformation.productIdentifier };
  res.status(201).json(response);
});

app.get('/bo/dbp/', async (req, res) => {
  await connectMongo();
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 25;
  
  if (page < 1 || limit < 1) {
    return apiError(res, 400, 'BadRequest', 'page and limit must be positive integers.');
  }
  
  const skip = (page - 1) * limit;
  const total = await passportsCollection.countDocuments({});
  const passports = await passportsCollection
    .find({})
    .skip(skip)
    .limit(limit)
    .toArray();
  
  res.json({
    items: passports,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

app.get('/bo/dbp/:resourceId', async (req, res) => {
  const passport = await getPassport(req.params.resourceId);
  if (!passport) return notFound(res);
  res.json(passport);
});

app.get('/bo/dbp/:resourceId/performance', async (req, res) => {
  const passport = await getPassport(req.params.resourceId);
  if (!passport) return notFound(res, `Battery passport '${req.params.resourceId}' was not found.`);
  res.json(passport.performance);
});

app.post('/bo/dbp/:resourceId/performance', async (req, res) => {
  const passport = await getPassport(req.params.resourceId);
  if (!passport) return notFound(res, `Battery passport '${req.params.resourceId}' was not found.`);
  passport.performance = req.body as Performance;
  await connectMongo();
  await passportsCollection.replaceOne(
    { 'generalProductInformation.productIdentifier': req.params.resourceId } as never,
    passport,
    { upsert: true },
  );
  res.status(201).json(passport);
});

app.get('/bo/dbp/:resourceId/maintenance', async (req, res) => {
  const passport = await getPassport(req.params.resourceId);
  if (!passport) return notFound(res, `Battery passport '${req.params.resourceId}' was not found.`);
  res.json(passport.maintenanceInformation);
});

app.post('/bo/dbp/:resourceId/maintenance', async (req, res) => {
  const passport = await getPassport(req.params.resourceId);
  if (!passport) return notFound(res, `Battery passport '${req.params.resourceId}' was not found.`);
  passport.maintenanceInformation.push(req.body as MaintenanceInformationItem);
  await connectMongo();
  await passportsCollection.replaceOne(
    { 'generalProductInformation.productIdentifier': req.params.resourceId } as never,
    passport,
    { upsert: true },
  );
  res.status(201).json({ status: 'registered successfully' });
});

app.get('/bo/dbp/:resourceId/dynamic-updates', async (req, res) => {
  const passport = await getPassport(req.params.resourceId);
  if (!passport) return notFound(res, `Battery passport '${req.params.resourceId}' was not found.`);
  res.json(passport.dynamicUpdates || []);
});

app.get('/bo/dbp/t2/:resourceId/dynamic-updates', (req, res) => {
  res.redirect(302, `/bo/dbp/${req.params.resourceId}/dynamic-updates`);
});

app.get('/bo/dbp/t3/:resourceId/dynamic-updates', (req, res) => {
  res.redirect(302, `/bo/dbp/${req.params.resourceId}/dynamic-updates`);
});


app.get('/bo/dbp/t2/:resourceId', async (req, res) => {
  const passport = await getPassport(req.params.resourceId);
  if (!passport) return notFound(res);
  res.json(passport);
});

app.get('/bo/dbp/t3/:resourceId', async (req, res) => {
  const passport = await getPassport(req.params.resourceId);
  if (!passport) return notFound(res);
  res.json(passport);
});

app.get('/bo/dbp/t2/:resourceId/performance', (req, res) => {
  res.redirect(302, `/bo/dbp/${req.params.resourceId}/performance`);
});

app.post('/bo/dbp/t2/:resourceId/performance', (req, res) => {
  res.redirect(302, `/bo/dbp/${req.params.resourceId}/performance`);
});

app.get('/bo/dbp/t3/:resourceId/performance', (req, res) => {
  res.redirect(302, `/bo/dbp/${req.params.resourceId}/performance`);
});

app.get('/bo/dbp/t2/:resourceId/maintenance', (req, res) => {
  res.redirect(302, `/bo/dbp/${req.params.resourceId}/maintenance`);
});

app.post('/bo/dbp/t2/:resourceId/maintenance', (req, res) => {
  res.redirect(302, `/bo/dbp/${req.params.resourceId}/maintenance`);
});

app.get('/bo/dbp/t3/:resourceId/maintenance', (req, res) => {
  res.redirect(302, `/bo/dbp/${req.params.resourceId}/maintenance`);
});

app.use((req, res) => notFound(res, `Endpoint '${req.method} ${req.originalUrl}' was not found.`));

export default app;
