# Backend de Build Routine

## Configuración

1. Instala las dependencias con `npm install`.
2. Configura `backend/.env` con `MONGODB_URI`. Para una instancia local:
   `MONGODB_URI=mongodb://127.0.0.1:27017/build-routine`. Para Atlas, usa la URI
   `mongodb+srv://` que proporciona el panel del cluster.
3. Carga el catálogo (rutinas y ejercicios) con `npm run seed`. Se puede repetir sin duplicar.
4. Inicia el servidor con `npm start` (o `npm run dev` durante el desarrollo).
   Ejecuta el comando desde la carpeta `backend`. La app conecta primero con
   MongoDB y luego escucha en el puerto indicado por `PORT` (3000 por defecto).
   El endpoint `GET /health` informa el estado del servidor y de la base de
   datos.

MongoDB debe estar instalado y ejecutándose en el host y puerto indicados antes
de iniciar el backend. La app no inicia el proceso de MongoDB; solo establece la
conexión con el servidor. En Windows, una vez instalado MongoDB como servicio,
puedes iniciarlo desde PowerShell como administrador con `Start-Service MongoDB`
y comprobarlo con `Get-Service MongoDB`.

Los modelos están en `src/models`: `User`, `Routine`, `Seguimiento`, `Plantilla` (catálogo de rutinas) y `Ejercicio` (fichas con tips y animación). Una rutina
contiene días y cada día contiene ejercicios; los identificadores de esos
subdocumentos permiten guardar checks mediante `diaId` y `ejercicioId`.

## API

| Método | Ruta | Qué devuelve |
|---|---|---|
| GET | `/api/plantillas` | Todas las rutinas del catálogo. Filtros opcionales: `nivel` (principiante, intermedio, avanzado), `categoria`, `sexo` (masculino, femenino, unisex). Pedir un sexo también trae las unisex. |
| GET | `/api/plantillas/:codigo` | Una rutina, por ejemplo `/api/plantillas/hipertrofia-pectoral-avanzado`. 404 si no existe. |
| GET | `/api/ejercicios` | Las fichas de ejercicios (tips, error común, video). |
| GET | `/api/ejercicios/:codigo` | Una ficha, por ejemplo `/api/ejercicios/sentadilla-barra`. 404 si no existe. |

Un filtro con un valor inválido responde 400 con los valores posibles. Los errores siempre vienen como `{ "error": "mensaje" }`.

## Estructura

- `src/server.js`: conecta a MongoDB y levanta el servidor.
- `src/app.js`: arma la app de Express. No se conecta a nada; recibe los repositorios de datos.
- `src/repos/mongoRepos.js`: la única parte que consulta MongoDB.
- `src/routes/`: rutas de la API. `src/middlewares/errores.js`: respuestas de error.

## Tests

`npm test` corre los tests de modelos y de la API. Los de la API usan repositorios en memoria
(`test/helpers/memoriaRepos.js`) con los mismos datos de `recursos/`, así que no necesitan MongoDB.
