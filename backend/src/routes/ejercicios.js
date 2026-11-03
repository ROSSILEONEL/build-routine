import { Router } from 'express';
import { ErrorHttp } from '../middlewares/errores.js';

export function ejerciciosRouter(repo) {
  const router = Router();

  // GET /api/ejercicios
  router.get('/', async (_request, response) => {
    response.json(await repo.listar());
  });

  // GET /api/ejercicios/sentadilla-barra
  router.get('/:codigo', async (request, response) => {
    const ejercicio = await repo.buscar(request.params.codigo);
    if (!ejercicio) throw new ErrorHttp(404, 'No existe un ejercicio con ese código');
    response.json(ejercicio);
  });

  return router;
}
