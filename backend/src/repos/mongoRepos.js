import Ejercicio from '../models/Ejercicio.js';
import Plantilla from '../models/Plantilla.js';

// Los "repositorios" son la única parte que habla con MongoDB.
// Las rutas solo conocen estas funciones, así en los tests se pueden
// reemplazar por datos en memoria (ver test/helpers/memoriaRepos.js).

// Campos internos que no le interesan al front.
const OCULTOS_PLANTILLA = '-_id -__v -createdAt -updatedAt -origen -dias._id -dias.ejercicios._id';
const OCULTOS_EJERCICIO = '-_id -__v -createdAt -updatedAt';

function consultaPlantillas({ nivel, categoria, sexo }) {
  const consulta = {};
  if (nivel) consulta.nivel = nivel;
  if (categoria) consulta.categoria = categoria;
  // Pedir "femenino" o "masculino" también trae las rutinas unisex.
  if (sexo) consulta.sexo = sexo === 'unisex' ? 'unisex' : { $in: [sexo, 'unisex'] };
  return consulta;
}

export const plantillasRepo = {
  listar(filtros) {
    return Plantilla.find(consultaPlantillas(filtros)).select(OCULTOS_PLANTILLA).sort({ _id: 1 }).lean();
  },
  buscar(codigo) {
    return Plantilla.findOne({ codigo }).select(OCULTOS_PLANTILLA).lean();
  },
};

export const ejerciciosRepo = {
  listar() {
    return Ejercicio.find().select(OCULTOS_EJERCICIO).sort({ codigo: 1 }).lean();
  },
  buscar(codigo) {
    return Ejercicio.findOne({ codigo }).select(OCULTOS_EJERCICIO).lean();
  },
};
