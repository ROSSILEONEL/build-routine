import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { crearReposEnMemoria } from './helpers/memoriaRepos.js';

const repos = await crearReposEnMemoria();
const app = createApp(repos);

describe('GET /api/plantillas', () => {
  test('sin filtros devuelve todas las rutinas', async () => {
    const res = await request(app).get('/api/plantillas').expect(200);
    assert.equal(res.body.length, repos.datos.plantillas.length);
    assert.ok(res.body[0].codigo);
  });

  test('filtra por nivel', async () => {
    const res = await request(app).get('/api/plantillas?nivel=avanzado').expect(200);
    assert.ok(res.body.length > 0);
    assert.ok(res.body.every((p) => p.nivel === 'avanzado'));
  });

  test('combina nivel y categoría', async () => {
    const res = await request(app).get('/api/plantillas?nivel=intermedio&categoria=hipertrofia').expect(200);
    assert.ok(res.body.length > 0);
    assert.ok(res.body.every((p) => p.nivel === 'intermedio' && p.categoria === 'hipertrofia'));
  });

  test('pedir un sexo también trae las rutinas unisex', async () => {
    const res = await request(app).get('/api/plantillas?sexo=femenino').expect(200);
    assert.ok(res.body.every((p) => ['femenino', 'unisex'].includes(p.sexo)));
  });

  test('un filtro vacío se ignora', async () => {
    const res = await request(app).get('/api/plantillas?nivel=').expect(200);
    assert.equal(res.body.length, repos.datos.plantillas.length);
  });

  test('un nivel inválido responde 400 y dice los valores posibles', async () => {
    const res = await request(app).get('/api/plantillas?nivel=experto').expect(400);
    assert.match(res.body.error, /principiante, intermedio, avanzado/);
  });

  test('un filtro repetido (?nivel=a&nivel=b) responde 400', async () => {
    await request(app).get('/api/plantillas?nivel=avanzado&nivel=intermedio').expect(400);
  });
});

describe('GET /api/plantillas/:codigo', () => {
  test('devuelve una rutina con sus días y ejercicios', async () => {
    const codigo = repos.datos.plantillas[0].codigo;
    const res = await request(app).get(`/api/plantillas/${codigo}`).expect(200);
    assert.equal(res.body.codigo, codigo);
    assert.ok(res.body.dias[0].ejercicios.length > 0);
  });

  test('un código que no existe responde 404', async () => {
    const res = await request(app).get('/api/plantillas/no-existe').expect(404);
    assert.ok(res.body.error);
  });
});

describe('GET /api/ejercicios', () => {
  test('lista las fichas con tips', async () => {
    const res = await request(app).get('/api/ejercicios').expect(200);
    assert.equal(res.body.length, repos.datos.ejercicios.length);
    assert.ok(res.body.every((e) => e.tips.length > 0));
  });

  test('cada ejercicio de las rutinas tiene su ficha', async () => {
    const codigos = new Set(repos.datos.ejercicios.map((e) => e.codigo));
    const faltan = repos.datos.plantillas
      .flatMap((p) => p.dias.flatMap((d) => d.ejercicios))
      .filter((ej) => ej.ejercicioId && !codigos.has(ej.ejercicioId));
    assert.deepEqual(faltan, []);
  });

  test('busca una ficha por código y responde 404 si no existe', async () => {
    const res = await request(app).get('/api/ejercicios/sentadilla-barra').expect(200);
    assert.equal(res.body.nombre, 'Sentadilla con barra');
    await request(app).get('/api/ejercicios/no-existe').expect(404);
  });
});

describe('errores generales', () => {
  test('una ruta inexistente responde 404 en JSON', async () => {
    const res = await request(app).get('/api/cualquier-cosa').expect(404);
    assert.equal(res.body.error, 'Ruta no encontrada');
  });

  test('si el repositorio falla, responde 500 sin mostrar detalles internos', async () => {
    const roto = createApp({
      ...repos,
      plantillas: { listar: async () => { throw new Error('se cayó Mongo'); }, buscar: async () => null },
    });
    const original = console.error;
    console.error = () => {}; // silenciamos el log esperado
    const res = await request(roto).get('/api/plantillas').expect(500);
    console.error = original;
    assert.equal(res.body.error, 'Error interno del servidor');
  });

  test('/health informa el estado de la base', async () => {
    await request(app).get('/health').expect(200);
    await request(createApp({ ...repos, dbConectada: () => false })).get('/health').expect(503);
  });
});
