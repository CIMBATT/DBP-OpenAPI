import * as fs from 'fs';
import * as yaml from 'js-yaml';

export interface ApiConfig {
  port: number;
  apiKey: string;
  boApiUrl: string;
  boApiKey: string;
}

const loadConfig = (): ApiConfig => {
  const configPath = './config.yaml';
  const fileContents = fs.readFileSync(configPath, 'utf8');
  const data = yaml.load(fileContents) as Record<string, unknown>;

  const port = data.port as number | undefined;
  const apiKey = data.apiKey as string | undefined;
  const boApiUrl = data.boApiUrl as string | undefined;
  const boApiKey = data.boApiKey as string | undefined;

  if (!port || !apiKey || !boApiUrl || !boApiKey) {
    throw new Error('Missing required config values: port, apiKey, boApiUrl, boApiKey');
  }

  return {
    port,
    apiKey,
    boApiUrl: boApiUrl.replace(/\/$/, ''),
    boApiKey,
  };
};

export const config = loadConfig();
