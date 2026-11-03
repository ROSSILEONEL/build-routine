import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) throw new Error('Configura MONGODB_URI en backend/.env.');

  await mongoose.connect(uri);
  console.log('MongoDB conectada.');
}
