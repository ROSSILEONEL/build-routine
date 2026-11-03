import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import mongoose from 'mongoose';
import { connectDB } from './config/database.js';
import Ejercicio from './models/Ejercicio.js';
import Plantilla from './models/Plantilla.js';

const leerJson = async (nombre) =>
  JSON.parse(await readFile(new URL(`../../recursos/${nombre}`, import.meta.url), 'utf8'));

// Los JSON usan "id"; en Mongo lo guardamos como "codigo" (el _id lo pone Mongo).
const aDocumento = ({ id, ...resto }) => ({ codigo: id, ...resto });

// Upsert por "codigo": se puede correr varias veces sin duplicar.
async function cargar(Modelo, documentos, etiqueta) {
  const resultado = await Modelo.bulkWrite(
    documentos.map((documento) => ({
      replaceOne: { filter: { codigo: documento.codigo }, replacement: documento, upsert: true },
    }))
  );
  console.log(
    `${etiqueta}: ${resultado.upsertedCount} nuevas, ${resultado.modifiedCount} actualizadas (de ${documentos.length}).`
  );
}

try {
  const plantillas = (await leerJson('rutinas.json')).map(aDocumento);
  const ejercicios = (await leerJson('ejercicios.json')).map(aDocumento);

  // Validamos todo antes de tocar la base: si algo está mal, no se carga nada.
  for (const p of plantillas) await new Plantilla(p).validate();
  for (const e of ejercicios) await new Ejercicio(e).validate();

  await connectDB();
  await cargar(Ejercicio, ejercicios, 'Ejercicios');
  await cargar(Plantilla, plantillas, 'Plantillas');
} catch (error) {
  console.error('No se pudo cargar el catálogo:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
