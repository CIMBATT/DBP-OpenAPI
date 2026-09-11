import app from './app';

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => {
  console.log(`Digital Battery Passport API listening on http://localhost:${PORT}`);
  console.log(`Using API key: ${process.env.API_KEY ?? 'demo-api-key'}`);
});
