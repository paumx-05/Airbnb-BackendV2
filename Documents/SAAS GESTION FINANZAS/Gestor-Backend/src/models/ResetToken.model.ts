import mongoose, { Document, Schema } from 'mongoose';

export interface IResetToken extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const ResetTokenSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El userId es requerido']
    },
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      lowercase: true,
      trim: true
    },
    token: {
      type: String,
      required: [true, 'El token es requerido'],
      unique: true
    },
    expiresAt: {
      type: Date,
      required: [true, 'La fecha de expiración es requerida'],
      index: { expireAfterSeconds: 0 } // TTL index - elimina automáticamente documentos expirados
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Índices para búsquedas rápidas
ResetTokenSchema.index({ token: 1 });
ResetTokenSchema.index({ email: 1 });
ResetTokenSchema.index({ userId: 1 });
// TTL index - MongoDB elimina automáticamente documentos cuando expiresAt pasa
ResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ResetToken = mongoose.model<IResetToken>('ResetToken', ResetTokenSchema);

