require('dotenv').config();

const http = require('http');
const app = require('./app');
const db = require('./db');
const { initSocket } = require('./sockets');

const port = Number(process.env.PORT || 4000);

const server = http.createServer(app);
initSocket(server);

server.listen(port, () => {
  console.log(`[HackQuest] Server running on port ${port}`);
});

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
