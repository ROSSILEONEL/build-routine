import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  icon: { type: String, default: '' },
  name: { type: String, required: true, trim: true },
  sets: { type: String, required: true },
  reps: { type: String, required: true },
  rest: { type: String, required: true },
});

const daySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  focus: { type: String, default: '' },
  exercises: { type: [exerciseSchema], default: [] },
});

const routineSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dias: { type: [daySchema], default: [] },
  },
  { timestamps: true }
);

routineSchema.index({ usuario: 1 });

export default mongoose.model('Routine', routineSchema);
