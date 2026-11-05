import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export type ApiConfig = {
  port: number;
  apiKey: string;
  oemName: string;
  mongoHost: string;
  mongoPort: number;
  mongoDb: string;
  bmsApiKey: string;
  bmsBaseUrl: string;
};

const configPath = path.resolve(process.cwd(), 'config.yaml');
const parsed = yaml.load(fs.readFileSync(configPath, 'utf8')) as Partial<ApiConfig>;

if (
  typeof parsed.port !== 'number' ||
  typeof parsed.apiKey !== 'string' ||
  typeof parsed.oemName !== 'string' ||
  typeof parsed.mongoHost !== 'string' ||
  typeof parsed.mongoPort !== 'number' ||
  typeof parsed.mongoDb !== 'string' ||
  (parsed.bmsApiKey !== undefined && typeof parsed.bmsApiKey !== 'string') ||
  (parsed.bmsBaseUrl !== undefined && typeof parsed.bmsBaseUrl !== 'string')
) {
  throw new Error(`Invalid API config in ${configPath}`);
}

export const config: ApiConfig = {
  port: parsed.port,
  apiKey: parsed.apiKey,
  oemName: parsed.oemName,
  mongoHost: parsed.mongoHost,
  mongoPort: parsed.mongoPort,
  mongoDb: parsed.mongoDb,
  bmsApiKey: process.env.BMS_API_KEY || parsed.bmsApiKey || '',
  bmsBaseUrl: (process.env.BMS_BASE_URL || parsed.bmsBaseUrl || 'http://localhost:59068').replace(/\/+$/, ''),
};
