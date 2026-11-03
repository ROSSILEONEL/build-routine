# Backend de Build Routine

## Configuración

1. Instala las dependencias con `npm install`.
2. Configura `backend/.env` con `MONGODB_URI`. Para una instancia local:
   `MONGODB_URI=mongodb://127.0.0.1:27017/build-routine`. Para Atlas, usa la URI
   `mongodb+srv://` que proporciona el panel del cluster.
3. Inicia el servidor con `npm start` (o `npm run dev` durante el desarrollo).
   Ejecuta el comando desde la carpeta `backend`. La app conecta primero con
   MongoDB y luego escucha en el puerto indicado por `PORT` (3000 por defecto).
   El endpoint `GET /health` informa el estado del servidor y de la base de
   datos.

MongoDB debe estar instalado y ejecutándose en el host y puerto indicados antes
de iniciar el backend. La app no inicia el proceso de MongoDB; solo establece la
conexión con el servidor. En Windows, una vez instalado MongoDB como servicio,
puedes iniciarlo desde PowerShell como administrador con `Start-Service MongoDB`
y comprobarlo con `Get-Service MongoDB`.

Los modelos están en `src/models`: `User`, `Routine` y `Seguimiento`. Una rutina
contiene días y cada día contiene ejercicios; los identificadores de esos
subdocumentos permiten guardar checks mediante `diaId` y `ejercicioId`.
