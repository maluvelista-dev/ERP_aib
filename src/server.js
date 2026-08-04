import app from './app.js';
import { env } from './config/env.js';

const server = app.listen(env.port, () => {
  console.log(`OrdersWeb API running on port ${env.port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${env.port} is already in use. Set another PORT value or stop the running process.`);
    process.exit(1);
  }

  throw error;
});
