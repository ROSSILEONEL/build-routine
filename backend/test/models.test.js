import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import Routine from '../src/models/Routine.js';
import Seguimiento from '../src/models/Seguimiento.js';
import User from '../src/models/User.js';

test('User, Routine y Seguimiento aceptan documentos válidos', async () => {
  const user = new User({
    name: 'Ana',
    email: 'ana@example.com',
    age: 28,
    weight: 68,
    goal: 'muscle',
    passwordHash: 'hash-seguro',
  });
  const routine = new Routine({
    usuario: user._id,
    dias: [{
      name: 'Día A',
      exercises: [{ name: 'Sentadilla', sets: '4', reps: '8', rest: '90 seg' }],
    }],
  });
  const exerciseId = routine.dias[0].exercises[0]._id;
  const seguimiento = new Seguimiento({
    usuario: user._id,
    rutina: routine._id,
    diaId: routine.dias[0]._id,
    checks: [{ ejercicioId: exerciseId, completado: true, pesoUsadoKg: 40, repsHechas: 8 }],
  });

  await Promise.all([user.validate(), routine.validate(), seguimiento.validate()]);

  assert.ok(mongoose.isValidObjectId(seguimiento.checks[0].ejercicioId));
  assert.equal(seguimiento.checks[0].completado, true);
});

test('Seguimiento aplica valores por defecto y rechaza peso negativo', async () => {
  const seguimiento = new Seguimiento({
    usuario: new mongoose.Types.ObjectId(),
    rutina: new mongoose.Types.ObjectId(),
    diaId: new mongoose.Types.ObjectId(),
    checks: [{ ejercicioId: new mongoose.Types.ObjectId(), pesoUsadoKg: -1 }],
  });

  assert.equal(seguimiento.completado, false);
  await assert.rejects(seguimiento.validate(), (error) => {
    assert.ok(error.errors['checks.0.pesoUsadoKg']);
    return true;
  });
});

test('User rechaza objetivos no admitidos', async () => {
  const user = new User({
    name: 'Ana',
    email: 'ana@example.com',
    age: 28,
    weight: 68,
    goal: 'unknown',
    passwordHash: 'hash-seguro',
  });

  await assert.rejects(user.validate(), (error) => {
    assert.ok(error.errors.goal);
    return true;
  });
});
