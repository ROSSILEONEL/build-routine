import express from 'express';
import { manejarErrores, rutaNoEncontrada } from './middlewares/errores.js';
import { ejerciciosRouter } from './routes/ejercicios.js';
import { plantillasRouter } from './routes/plantillas.js';

// Arma la app sin conectarse a nada: recibe los repositorios de datos.
// server.js le pasa los de MongoDB; los tests le pasan datos en memoria.
export function createApp({ plantillas, ejercicios, dbConectada = () => true }) {
  const app = express();

  app.use(express.json());

  app.get('/health', (_request, response) => {
    const connected = dbConectada();
    response.status(connected ? 200 : 503).json({
      status: connected ? 'ok' : 'unavailable',
      database: connected ? 'connected' : 'disconnected',
    });
  });

  app.use('/api/plantillas', plantillasRouter(plantillas));
  app.use('/api/ejercicios', ejerciciosRouter(ejercicios));

  app.use(rutaNoEncontrada);
  app.use(manejarErrores);

  return app;
}
