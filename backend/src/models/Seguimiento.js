import mongoose from 'mongoose';

const checkSchema = new mongoose.Schema(
  {
    ejercicioId: { type: mongoose.Schema.Types.ObjectId, required: true },
    completado: { type: Boolean, default: false },
    pesoUsadoKg: { type: Number, min: 0 },
    repsHechas: { type: Number, min: 0 },
  },
  { _id: false }
);

const seguimientoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rutina: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Routine',
      required: true,
    },
    diaId: { type: mongoose.Schema.Types.ObjectId, required: true },
    fecha: { type: Date, default: Date.now },
    checks: { type: [checkSchema], default: [] },
    completado: { type: Boolean, default: false },
  },
  { timestamps: true }
);

seguimientoSchema.index({ usuario: 1, fecha: -1 });

export default mongoose.model('Seguimiento', seguimientoSchema);
