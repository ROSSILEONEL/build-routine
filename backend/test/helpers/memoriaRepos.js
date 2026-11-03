import { readFile } from 'node:fs/promises';

// Repositorios falsos para los tests: mismos datos que el seed, pero en memoria.
// Imitan lo que devuelve mongoRepos.js (con "codigo" y sin "origen").

const leerJson = async (nombre) =>
  JSON.parse(await readFile(new URL(`../../../recursos/${nombre}`, import.meta.url), 'utf8'));

export async function crearReposEnMemoria() {
  const plantillas = (await leerJson('rutinas.json')).map(({ id, origen, ...resto }) => ({ codigo: id, ...resto }));
  const ejercicios = (await leerJson('ejercicios.json')).map(({ id, ...resto }) => ({ codigo: id, ...resto }));

  const cumple = (p, { nivel, categoria, sexo }) =>
    (!nivel || p.nivel === nivel)
    && (!categoria || p.categoria === categoria)
    && (!sexo || p.sexo === sexo || (sexo !== 'unisex' && p.sexo === 'unisex'));

  return {
    plantillas: {
      listar: async (filtros) => plantillas.filter((p) => cumple(p, filtros)),
      buscar: async (codigo) => plantillas.find((p) => p.codigo === codigo) ?? null,
    },
    ejercicios: {
      listar: async () => ejercicios,
      buscar: async (codigo) => ejercicios.find((e) => e.codigo === codigo) ?? null,
    },
    datos: { plantillas, ejercicios },
  };
}
