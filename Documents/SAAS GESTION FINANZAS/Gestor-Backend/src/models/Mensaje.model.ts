import mongoose, { Document, Schema } from 'mongoose';

export interface IMensaje extends Document {
  userId: mongoose.Types.ObjectId;
  remitente: string;
  asunto: string;
  contenido: string;
  leido: boolean;
  createdAt: Date;
}

const MensajeSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El userId es requerido']
    },
    remitente: {
      type: String,
      required: [true, 'El remitente es requerido'],
      trim: true
    },
    asunto: {
      type: String,
      required: [true, 'El asunto es requerido'],
      trim: true
    },
    contenido: {
      type: String,
      required: [true, 'El contenido es requerido'],
      trim: true
    },
    leido: {
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
MensajeSchema.index({ userId: 1, leido: 1 });
MensajeSchema.index({ userId: 1, createdAt: -1 });

export const Mensaje = mongoose.model<IMensaje>('Mensaje', MensajeSchema);

