// Error con código HTTP: lo lanzan las rutas (throw new ErrorHttp(404, '...'))
// y lo transforma en respuesta el manejador de abajo.
export class ErrorHttp extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

export function rutaNoEncontrada(_request, response) {
  response.status(404).json({ error: 'Ruta no encontrada' });
}

// Express 5 manda acá los errores de las rutas async sin necesidad de try/catch.
// eslint-disable-next-line no-unused-vars
export function manejarErrores(error, _request, response, _next) {
  if (error instanceof ErrorHttp) {
    return response.status(error.status).json({ error: error.message });
  }
  console.error(error);
  response.status(500).json({ error: 'Error interno del servidor' });
}
