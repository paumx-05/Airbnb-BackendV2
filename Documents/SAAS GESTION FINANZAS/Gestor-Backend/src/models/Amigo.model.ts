import mongoose, { Document, Schema } from 'mongoose';

export interface IAmigo extends Document {
  userId: mongoose.Types.ObjectId; // Usuario que tiene este amigo en su lista
  amigoUserId: mongoose.Types.ObjectId; // ID del usuario que es el amigo (referencia a User)
  nombre: string;
  email: string;
  avatar?: string;
  estado: 'pendiente' | 'activo' | 'rechazada' | 'bloqueado';
  solicitadoPor: mongoose.Types.ObjectId; // ID del usuario que envió la solicitud
  fechaAmistad?: Date; // Solo se establece cuando se acepta
  createdAt: Date;
}

const AmigoSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El userId es requerido']
    },
    amigoUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El amigoUserId es requerido']
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
      enum: ['pendiente', 'activo', 'rechazada', 'bloqueado'],
      default: 'pendiente'
    },
    solicitadoPor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El solicitadoPor es requerido']
    },
    fechaAmistad: {
      type: Date
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

// Índice único compuesto: un usuario no puede tener el mismo amigo dos veces
AmigoSchema.index({ userId: 1, amigoUserId: 1 }, { unique: true });
AmigoSchema.index({ userId: 1, estado: 1 });
AmigoSchema.index({ amigoUserId: 1, estado: 1 }); // Para buscar solicitudes recibidas
AmigoSchema.index({ solicitadoPor: 1, estado: 1 }); // Para buscar solicitudes enviadas

export const Amigo = mongoose.model<IAmigo>('Amigo', AmigoSchema);

