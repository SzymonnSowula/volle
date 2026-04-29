import { buildApp } from './index';

async function main() {
  const app = await buildApp();

  const port = parseInt(process.env.API_PORT || '3001', 10);
  const host = process.env.API_HOST || '0.0.0.0';

  try {
    await app.listen({ port, host });
    console.log(`Server running on http://${host}:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

main();
