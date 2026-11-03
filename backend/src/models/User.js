import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    age: { type: Number, required: true, min: 13, max: 100 },
    weight: { type: Number, required: true, min: 20, max: 500 },
    goal: {
      type: String,
      enum: ['strength', 'muscle', 'lose', 'wellness'],
      required: true,
    },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
