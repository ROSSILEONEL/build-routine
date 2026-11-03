import mongoose from 'mongoose';

export const NIVELES = ['principiante', 'intermedio', 'avanzado'];
export const SEXOS = ['masculino', 'femenino', 'unisex'];
export const CATEGORIAS = [
  'fuerza',
  'fuerza_empuje_tiron',
  'fuerza_explosividad',
  'explosividad',
  'hipertrofia',
  'grupos_musculares',
];
export const SECCIONES = [
  'principal',
  'complementario',
  'potencia',
  'empuje',
  'tiron',
  'piernas',
];

// Calentamiento y enfriamiento no llevan series: solo nombre y duración.
const tiempoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    duracion: { type: String, default: null },
  },
  { _id: false }
);

const ejercicioSchema = new mongoose.Schema({
  orden: { type: Number, required: true, min: 1 },
  nombre: { type: String, required: true, trim: true },
  seccion: { type: String, enum: SECCIONES, default: 'principal' },
  ejercicioId: { type: String, default: null }, // ficha en recursos/ejercicios.json (tips + animación)
  series: { type: Number, min: 1, max: 20, default: null },
  repeticiones: { type: String, default: null },
  descanso: { type: String, default: null },
  revisar: { type: Boolean, default: undefined }, // dato dudoso del Excel
});

const diaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  ejercicios: { type: [ejercicioSchema], default: [] },
});

// Catálogo de rutinas base (salen del Excel). La rutina de cada usuario
// (modelo Routine) se arma copiando una de estas plantillas.
const plantillaSchema = new mongoose.Schema(
  {
    codigo: { type: String, required: true, unique: true, trim: true },
    nombre: { type: String, required: true, trim: true },
    nivel: { type: String, enum: NIVELES, required: true },
    categoria: { type: String, enum: CATEGORIAS, required: true },
    sexo: { type: String, enum: SEXOS, default: 'unisex' },
    calentamiento: { type: [tiempoSchema], default: [] },
    dias: {
      type: [diaSchema],
      validate: [(v) => v.length > 0, 'La plantilla necesita al menos un día'],
    },
    enfriamiento: { type: [tiempoSchema], default: [] },
    origen: { type: String, default: '' },
  },
  { timestamps: true }
);

plantillaSchema.index({ nivel: 1, sexo: 1, categoria: 1 });

export default mongoose.model('Plantilla', plantillaSchema);
