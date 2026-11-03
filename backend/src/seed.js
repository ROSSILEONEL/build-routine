import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import mongoose from 'mongoose';
import { connectDB } from './config/database.js';
import Plantilla from './models/Plantilla.js';

const archivo = new URL('../../recursos/rutinas.json', import.meta.url);

// El JSON usa "id"; en Mongo lo guardamos como "codigo" (el _id lo pone Mongo).
const aDocumento = ({ id, ...resto }) => ({ codigo: id, ...resto });

try {
  const rutinas = JSON.parse(await readFile(archivo, 'utf8')).map(aDocumento);

  // Validamos todo antes de tocar la base: si algo está mal, no se carga nada.
  for (const rutina of rutinas) await new Plantilla(rutina).validate();

  await connectDB();
  // upsert por "codigo": se puede correr varias veces sin duplicar.
  const resultado = await Plantilla.bulkWrite(
    rutinas.map((rutina) => ({
      replaceOne: { filter: { codigo: rutina.codigo }, replacement: rutina, upsert: true },
    }))
  );
  console.log(
    `Plantillas cargadas: ${resultado.upsertedCount} nuevas, ${resultado.modifiedCount} actualizadas (de ${rutinas.length}).`
  );
} catch (error) {
  console.error('No se pudo cargar el catálogo:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
