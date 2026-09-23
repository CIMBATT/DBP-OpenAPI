import { MongoClient, type Collection } from 'mongodb';
import { config } from './config';
import type { DigitalBatteryPassport } from './types';

const client = new MongoClient(`mongodb://${config.mongoHost}:${config.mongoPort}`);
const db = client.db(config.mongoDb);

export const passportsCollection: Collection<DigitalBatteryPassport> = db.collection('bo_passports');

export async function connectMongo() {
  return client.connect();
}
