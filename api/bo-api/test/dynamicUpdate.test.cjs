const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { config } = require('../dist/config');
const mongo = require('../dist/mongo');

test('imports BMS updates into the matching passport dynamicUpdates array', async (t) => {
  const originalFetch = global.fetch;
  const originalConnect = mongo.connectMongo;
  const originalCollection = mongo.passportsCollection;
  const originalBmsKey = config.bmsApiKey;
  const id = 'battery #1';
  const update = {
    lastUpdate: '2026-10-28T10:00:00Z',
    generalProductInformation: {
      batteryStatus: 'in use',
      operatorInformation: { identifier: 'operator-id' },
    },
    performance: {
      batteryCondition: { capacityFade: { lastUpdate: '2026-10-28T10:00:00Z' }, internalResistanceIncrease: [] },
      batteryTechnicalProperties: { ratedMaximumPower: 0 },
    },
  };
  const existing = { ...update, lastUpdate: '2026-10-27T10:00:00Z' };
  const originalPerformance = { unchanged: true };
  let passport;
  let writes;
  let requests;
  let upstream;
  let writeError;
  let matchedCount;
  let sentSince;

  mongo.connectMongo = async () => {};
  mongo.passportsCollection = {
    findOne: async (filter) => {
      assert.equal(filter['generalProductInformation.productIdentifier'], id);
      return passport;
    },
    updateOne: async (filter, operation) => {
      writes++;
      assert.equal(filter['generalProductInformation.productIdentifier'], id);
      if (writeError) throw writeError;
      if (matchedCount === 0) return { matchedCount: 0 };
      if (operation.$set) passport.performance = operation.$set.performance;
      passport.dynamicUpdates ??= [];
      for (const item of operation.$addToSet.dynamicUpdates.$each) {
        if (!passport.dynamicUpdates.some((stored) => JSON.stringify(stored) === JSON.stringify(item))) {
          passport.dynamicUpdates.push(item);
        }
      }
      return { matchedCount: 1 };
    },
  };
  config.bmsApiKey = 'separate-bms-test-key';
  const originalBaseUrl = config.bmsBaseUrl;
  config.bmsBaseUrl = 'http://bms.example.test:1234';
  global.fetch = async (url, options) => {
    requests++;
    const requested = new URL(url);
    assert.equal(`${requested.origin}${requested.pathname}`, `${config.bmsBaseUrl}/bms/${encodeURIComponent(id)}/performance/last`);
    sentSince.push(requested.searchParams.get('lastUpdatedAt'));
    assert.equal(options.headers['x-api-key'], 'separate-bms-test-key');
    assert.ok(options.signal instanceof AbortSignal);
    return upstream();
  };
  const app = require('../dist/app').default;
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = `http://127.0.0.1:${server.address().port}/bo/dbp/${encodeURIComponent(id)}/update`;
  const send = (key = config.apiKey) => originalFetch(url, { method: 'POST', headers: { 'x-api-key': key } });
  const reset = () => {
    passport = { generalProductInformation: { productIdentifier: id }, performance: originalPerformance, dynamicUpdates: [existing] };
    writes = 0;
    requests = 0;
    writeError = undefined;
    matchedCount = 1;
    sentSince = [];
    upstream = async () => new Response(JSON.stringify([update]), { status: 200 });
  };
  try {
    await t.test('appends entries and updates root performance; repeated imports do not duplicate', async () => {
      reset();
      for (let i = 0; i < 2; i++) {
        const response = await send();
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { status: 'dynamic updates imported successfully', DBPId: id, count: 1 });
      }
      assert.deepEqual(passport.dynamicUpdates, [existing, update]);
      assert.deepEqual(passport.performance, update.performance);
      assert.deepEqual(sentSince, [existing.lastUpdate, update.lastUpdate]);
    });
    await t.test('sends the latest lastUpdate regardless of array order and skips invalid timestamps', async () => {
      reset();
      passport.dynamicUpdates = [
        { lastUpdate: '2026-10-29T08:00:00+01:00' },
        { lastUpdate: '2026-10-27T10:00:00Z' },
        { lastUpdate: 'not a date' },
        {},
      ];
      assert.equal((await send()).status, 200);
      assert.deepEqual(sentSince, ['2026-10-29T08:00:00+01:00']);
    });
    await t.test('creates dynamicUpdates if absent', async () => {
      reset();
      delete passport.dynamicUpdates;
      assert.equal((await send()).status, 200);
      assert.deepEqual(passport.dynamicUpdates, [update]);
      assert.deepEqual(sentSince, [null]);
    });
    await t.test('empty array makes no database write', async () => {
      reset();
      upstream = async () => new Response('[]');
      assert.equal((await send()).status, 200);
      assert.equal(writes, 0);
      assert.deepEqual(passport.dynamicUpdates, [existing]);
      assert.equal(passport.performance, originalPerformance);
    });
    await t.test('root performance comes from the newest returned update regardless of array order', async () => {
      reset();
      const newest = {
        ...update,
        lastUpdate: '2026-10-29T08:00:00+01:00',
        performance: { ...update.performance, batteryTechnicalProperties: { ratedCapacity: 86 } },
      };
      upstream = async () => new Response(JSON.stringify([newest, update]));
      assert.equal((await send()).status, 200);
      assert.deepEqual(passport.performance, newest.performance);
      assert.equal(writes, 1);
      assert.deepEqual(passport.dynamicUpdates, [existing, newest, update]);
    });
    await t.test('accepts a single update or empty object from BMS performance/last', async () => {
      reset();
      upstream = async () => new Response(JSON.stringify(update));
      assert.equal((await send()).status, 200);
      assert.deepEqual(passport.performance, update.performance);
      assert.deepEqual(passport.dynamicUpdates, [existing, update]);
      reset();
      upstream = async () => new Response('{}');
      const response = await send();
      assert.equal(response.status, 200);
      assert.equal((await response.json()).count, 0);
      assert.equal(writes, 0);
      assert.equal(passport.performance, originalPerformance);
    });
    await t.test('updates without performance preserve root performance', async () => {
      reset();
      const { performance, ...withoutPerformance } = update;
      upstream = async () => new Response(JSON.stringify([withoutPerformance]));
      assert.equal((await send()).status, 200);
      assert.equal(passport.performance, originalPerformance);
      assert.deepEqual(passport.dynamicUpdates, [existing, withoutPerformance]);
    });
    await t.test('unauthorized and missing passports do not contact BMS', async () => {
      reset();
      assert.equal((await send('invalid')).status, 401);
      passport = null;
      assert.equal((await send()).status, 404);
      assert.equal(requests, 0);
      assert.equal(writes, 0);
    });
    await t.test('upstream HTTP, network, JSON and payload errors do not modify passport', async () => {
      for (const factory of [
        async () => new Response('unavailable', { status: 503 }),
        async () => { throw new Error('test network failure'); },
        async () => new Response('invalid json'),
        async () => new Response('{"invalid":true}'),
        async () => new Response('[{"lastUpdate":"invalid"}]'),
        async () => new Response(JSON.stringify([{ ...update, performance: { ...update.performance, batteryTechnicalProperties: { ratedMaximumPower: 'invalid' } } }])),
      ]) {
        reset();
        upstream = factory;
        assert.equal((await send()).status, 502);
        assert.equal(writes, 0);
        assert.deepEqual(passport.dynamicUpdates, [existing]);
      }
    });
    await t.test('missing BMS API key returns 503 without contacting BMS', async () => {
      reset();
      config.bmsApiKey = '';
      try {
        assert.equal((await send()).status, 503);
      } finally {
        config.bmsApiKey = 'separate-bms-test-key';
      }
      assert.equal(requests, 0);
      assert.equal(writes, 0);
    });
    await t.test('database errors and a passport removed during fetch are explicit', async () => {
      reset();
      writeError = new Error('test write failure');
      assert.equal((await send()).status, 500);
      reset();
      matchedCount = 0;
      assert.equal((await send()).status, 404);
    });
  } finally {
    global.fetch = originalFetch;
    mongo.connectMongo = originalConnect;
    mongo.passportsCollection = originalCollection;
    config.bmsApiKey = originalBmsKey;
    config.bmsBaseUrl = originalBaseUrl;
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
