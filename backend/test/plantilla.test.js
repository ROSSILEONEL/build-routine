import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import Plantilla from '../src/models/Plantilla.js';

const archivo = new URL('../../recursos/rutinas.json', import.meta.url);
const rutinas = JSON.parse(await readFile(archivo, 'utf8'));

test('todas las rutinas del JSON pasan la validación del modelo', async () => {
  assert.ok(rutinas.length > 0);
  for (const { id, ...resto } of rutinas) {
    await new Plantilla({ codigo: id, ...resto }).validate();
  }
});

test('los códigos del JSON son únicos', () => {
  const codigos = rutinas.map((r) => r.id);
  assert.equal(new Set(codigos).size, codigos.length);
});

test('rechaza un nivel inválido y una plantilla sin días', async () => {
  const mala = new Plantilla({
    codigo: 'x', nombre: 'X', nivel: 'experto', categoria: 'fuerza', dias: [],
  });
  await assert.rejects(mala.validate(), (error) => {
    assert.ok(error.errors.nivel);
    assert.ok(error.errors.dias);
    return true;
  });
});
