const express = require('express');
const cors = require('cors');
const path = require('node:path');
const apiRoutes = require('./routes');
const { AppError } = require('./utils/http');

const parseCorsOrigins = () => {
  if (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN.trim() === '*') {
    return '*';
  }

  return process.env.CORS_ORIGIN.split(',').map((value) => value.trim());
};

const app = express();

app.use(
  cors({
    origin: parseCorsOrigins(),
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/dummy', express.static(path.join(__dirname, '../public/dummy')));

app.get('/', (req, res) => {
  res.status(200).json({
    service: 'HackQuest Backend',
    status: 'running',
    docs: '/api/health',
    dummyFrontend: '/dummy',
  });
});

app.use('/api', apiRoutes);

app.use((req, res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const payload = {
    message: error.message || 'Internal server error',
  };

  if (error.details) {
    payload.details = error.details;
  }

  if (process.env.NODE_ENV !== 'production' && statusCode >= 500) {
    payload.stack = error.stack;
  }

  res.status(statusCode).json(payload);
});

module.exports = app;
