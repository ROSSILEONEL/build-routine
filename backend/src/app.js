import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import { connectDB } from './config/database.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (_request, response) => {
  const connected = mongoose.connection.readyState === 1;
  response.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'unavailable',
    database: connected ? 'connected' : 'disconnected',
  });
});

try {
  await connectDB();
  app.listen(port, () => console.log(`Servidor listo: http://localhost:${port}`));
} catch (error) {
  console.error('No se pudo iniciar el servidor:', error.message);
  process.exitCode = 1;
}
