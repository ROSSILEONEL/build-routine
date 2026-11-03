import { Router } from 'express';
import { CATEGORIAS, NIVELES, SEXOS } from '../models/Plantilla.js';
import { ErrorHttp } from '../middlewares/errores.js';

const FILTROS_PERMITIDOS = { nivel: NIVELES, categoria: CATEGORIAS, sexo: SEXOS };

// Toma solo los filtros conocidos de la URL y rechaza valores inválidos con 400.
function leerFiltros(query) {
  const filtros = {};
  for (const [campo, permitidos] of Object.entries(FILTROS_PERMITIDOS)) {
    const valor = query[campo];
    if (valor === undefined || valor === '') continue;
    if (typeof valor !== 'string' || !permitidos.includes(valor)) {
      throw new ErrorHttp(400, `"${campo}" inválido. Valores posibles: ${permitidos.join(', ')}`);
    }
    filtros[campo] = valor;
  }
  return filtros;
}

export function plantillasRouter(repo) {
  const router = Router();

  // GET /api/plantillas?nivel=avanzado&categoria=hipertrofia&sexo=femenino
  router.get('/', async (request, response) => {
    const plantillas = await repo.listar(leerFiltros(request.query));
    response.json(plantillas);
  });

  // GET /api/plantillas/hipertrofia-pectoral-avanzado
  router.get('/:codigo', async (request, response) => {
    const plantilla = await repo.buscar(request.params.codigo);
    if (!plantilla) throw new ErrorHttp(404, 'No existe una rutina con ese código');
    response.json(plantilla);
  });

  return router;
}
