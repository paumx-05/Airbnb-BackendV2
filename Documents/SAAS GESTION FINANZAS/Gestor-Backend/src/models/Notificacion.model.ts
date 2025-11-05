import mongoose, { Document, Schema } from 'mongoose';

export interface INotificacion extends Document {
  userId: mongoose.Types.ObjectId;
  tipo: 'info' | 'success' | 'warning' | 'error';
  titulo: string;
  mensaje: string;
  leida: boolean;
  createdAt: Date;
}

const NotificacionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El userId es requerido']
    },
    tipo: {
      type: String,
      required: [true, 'El tipo es requerido'],
      enum: ['info', 'success', 'warning', 'error']
    },
    titulo: {
      type: String,
      required: [true, 'El título es requerido'],
      trim: true
    },
    mensaje: {
      type: String,
      required: [true, 'El mensaje es requerido'],
      trim: true
    },
    leida: {
      type: Boolean,
      default: false
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

// Índices
NotificacionSchema.index({ userId: 1, leida: 1 });
NotificacionSchema.index({ userId: 1, createdAt: -1 });
NotificacionSchema.index({ userId: 1, tipo: 1 });

export const Notificacion = mongoose.model<INotificacion>('Notificacion', NotificacionSchema);

