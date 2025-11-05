import mongoose, { Document, Schema } from 'mongoose';

export interface IMensajeChat extends Document {
  remitenteId: mongoose.Types.ObjectId;
  destinatarioId: mongoose.Types.ObjectId;
  amigoId: mongoose.Types.ObjectId;
  contenido: string;
  esSistema: boolean;
  leido: boolean;
  createdAt: Date;
}

const MensajeChatSchema: Schema = new Schema(
  {
    remitenteId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El remitenteId es requerido']
    },
    destinatarioId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El destinatarioId es requerido']
    },
    amigoId: {
      type: Schema.Types.ObjectId,
      ref: 'Amigo',
      required: [true, 'El amigoId es requerido']
    },
    contenido: {
      type: String,
      required: [true, 'El contenido es requerido'],
      trim: true
    },
    esSistema: {
      type: Boolean,
      default: false
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
MensajeChatSchema.index({ amigoId: 1, createdAt: 1 });
MensajeChatSchema.index({ remitenteId: 1, destinatarioId: 1 });
MensajeChatSchema.index({ destinatarioId: 1, leido: 1 });

export const MensajeChat = mongoose.model<IMensajeChat>('MensajeChat', MensajeChatSchema);

