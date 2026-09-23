import app from './app';
import { config } from './config';

app.listen(config.port, () => {
  console.log(`Digital Battery Passport Public API listening on http://localhost:${config.port}`);
  console.log(`Using Public API key: ${config.apiKey}`);
});
