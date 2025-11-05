import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pablomaldonado422_db_user:Mbt3ylAXTIBSzhku@cluster0.tgnhplr.mongodb.net/gestor-finanzas?retryWrites=true&w=majority&appName=Cluster0';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000, // Timeout de 3 segundos
    });
    console.log('✅ MongoDB conectado exitosamente');
  } catch (error) {
    // No lanzamos el error, solo lo registramos
    // El servidor puede funcionar sin MongoDB
    throw error; // Lanzamos para que el catch del servidor lo maneje
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB desconectado');
  } catch (error) {
    console.error('❌ Error al desconectar MongoDB:', error);
  }
};

