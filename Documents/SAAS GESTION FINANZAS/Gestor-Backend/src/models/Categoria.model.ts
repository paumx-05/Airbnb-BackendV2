import mongoose, { Document, Schema } from 'mongoose';

export interface ICategoria extends Document {
  userId: mongoose.Types.ObjectId;
  nombre: string;
  tipo: 'gastos' | 'ingresos' | 'ambos';
  createdAt: Date;
}

const CategoriaSchema: Schema = new Schema(
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
    tipo: {
      type: String,
      required: [true, 'El tipo es requerido'],
      enum: ['gastos', 'ingresos', 'ambos']
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

// Índice único compuesto (nombre único por usuario)
CategoriaSchema.index({ userId: 1, nombre: 1 }, { unique: true });
CategoriaSchema.index({ userId: 1, tipo: 1 });

export const Categoria = mongoose.model<ICategoria>('Categoria', CategoriaSchema);

