require('dotenv').config();

const http = require('http');
const app = require('./app');
const db = require('./db');
const { initSocket } = require('./sockets');
const authService = require('./services/authService');

const port = Number(process.env.PORT || 4000);

const server = http.createServer(app);
initSocket(server);

const canBypassDbBootstrap = process.env.NODE_ENV !== 'production';

const startServer = async () => {
  try {
    try {
      await authService.ensureAuthSchema();
    } catch (error) {
      if (!canBypassDbBootstrap) {
        throw error;
      }

      console.warn('[HackQuest] Auth schema initialization failed, continuing in limited mode');
      console.warn('[HackQuest] DB-dependent endpoints may be unavailable until Postgres is reachable');
      console.warn(error);
    }

    server.listen(port, () => {
      console.log(`[HackQuest] Server running on port ${port}`);
    });
  } catch (error) {
    console.error('[HackQuest] Failed to initialize server', error);
    process.exit(1);
  }
};

startServer();

const shutdown = async (signal) => {
  console.log(`[HackQuest] Received ${signal}. Shutting down...`);

  server.close(async () => {
    try {
      await db.pool.end();
      console.log('[HackQuest] Shutdown complete');
      process.exit(0);
    } catch (error) {
      console.error('[HackQuest] Error during shutdown', error);
      process.exit(1);
    }
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
