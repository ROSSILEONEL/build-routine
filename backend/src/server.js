import 'dotenv/config';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { connectDB } from './config/database.js';
import { ejerciciosRepo, plantillasRepo } from './repos/mongoRepos.js';

const port = process.env.PORT || 3000;

try {
  await connectDB();
  const app = createApp({
    plantillas: plantillasRepo,
    ejercicios: ejerciciosRepo,
    dbConectada: () => mongoose.connection.readyState === 1,
  });
  app.listen(port, () => console.log(`Servidor listo: http://localhost:${port}`));
} catch (error) {
  console.error('No se pudo iniciar el servidor:', error.message);
  process.exitCode = 1;
}
