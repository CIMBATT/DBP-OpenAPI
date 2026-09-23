import app from './app';
import { config } from './config';

app.listen(config.port, () => {
  console.log(`Digital Battery Passport API listening on http://localhost:${config.port}`);
  console.log(`Using API key: ${config.apiKey}`);
});
