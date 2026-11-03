// Funciones para hablar con el backend. En desarrollo, Vite redirige /api a http://localhost:3000
// (ver vite.config.js), así el front y el back parecen estar en el mismo lugar.

async function pedir(ruta, signal) {
  let respuesta;
  try {
    respuesta = await fetch(`/api${ruta}`, { signal });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('No hay conexión con el servidor. ¿Está corriendo el backend?');
  }
  const cuerpo = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    // Nuestro backend siempre responde { error }. Sin cuerpo JSON, el pedido no llegó a Express
    // (por ejemplo, el proxy de Vite no encontró el servidor).
    throw new Error(cuerpo?.error ?? 'No hay conexión con el servidor. ¿Está corriendo el backend?');
  }
  return cuerpo;
}

// filtros: { nivel, categoria, sexo } (todos opcionales)
export function obtenerPlantillas(filtros = {}, signal) {
  const query = new URLSearchParams(Object.entries(filtros).filter(([, valor]) => valor)).toString();
  return pedir(`/plantillas${query ? `?${query}` : ''}`, signal);
}

export function obtenerPlantilla(codigo, signal) {
  return pedir(`/plantillas/${encodeURIComponent(codigo)}`, signal);
}

export function obtenerEjercicios(signal) {
  return pedir('/ejercicios', signal);
}
