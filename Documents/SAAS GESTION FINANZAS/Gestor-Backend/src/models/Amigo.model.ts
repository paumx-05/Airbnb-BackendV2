import mongoose, { Document, Schema } from 'mongoose';

export interface IAmigo extends Document {
  userId: mongoose.Types.ObjectId;
  nombre: string;
  email: string;
  avatar?: string;
  estado: 'activo' | 'pendiente' | 'bloqueado';
  fechaAmistad: Date;
  createdAt: Date;
}

const AmigoSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El userId es requerido']
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      lowercase: true,
      trim: true
    },
    avatar: {
      type: String,
      trim: true
    },
    estado: {
      type: String,
      required: [true, 'El estado es requerido'],
      enum: ['activo', 'pendiente', 'bloqueado'],
      default: 'activo'
    },
    fechaAmistad: {
      type: Date,
      default: Date.now
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

// Índice único compuesto (email único por usuario)
AmigoSchema.index({ userId: 1, email: 1 }, { unique: true });
AmigoSchema.index({ userId: 1, estado: 1 });

export const Amigo = mongoose.model<IAmigo>('Amigo', AmigoSchema);

