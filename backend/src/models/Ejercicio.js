import mongoose from 'mongoose';

// Ficha de un ejercicio base: tips de técnica, error común y animación.
// Las rutinas apuntan a estas fichas con "ejercicioId" (= codigo).
const ejercicioSchema = new mongoose.Schema(
  {
    codigo: { type: String, required: true, unique: true, trim: true },
    nombre: { type: String, required: true, trim: true },
    musculo: { type: String, required: true, trim: true },
    tips: {
      type: [String],
      validate: [(v) => v.length > 0, 'El ejercicio necesita al menos un tip'],
    },
    errorComun: { type: String, default: '' },
    video: { type: String, default: null }, // ruta pública del WebM, ej: /ejercicios/plancha.webm
    fuente: { type: String, default: null }, // id en free-exercise-db
  },
  { timestamps: true }
);

export default mongoose.model('Ejercicio', ejercicioSchema);
