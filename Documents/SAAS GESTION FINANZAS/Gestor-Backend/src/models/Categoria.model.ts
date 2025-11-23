import mongoose, { Document, Schema } from 'mongoose';

export interface ICategoria extends Document {
  userId: mongoose.Types.ObjectId;
  nombre: string;
  tipo: 'gastos' | 'ingresos' | 'ambos';
  subcategorias?: string[];
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
    subcategorias: [{
      type: String,
      trim: true,
      maxlength: 50
    }],
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

// Validación personalizada: máximo 20 subcategorías y eliminación de duplicados
CategoriaSchema.pre('save', function(next) {
  if (this.subcategorias && this.subcategorias.length > 20) {
    return next(new Error('Máximo 20 subcategorías permitidas por categoría'));
  }
  
  // Eliminar duplicados y vacíos automáticamente
  if (this.subcategorias) {
    this.subcategorias = [...new Set(
      this.subcategorias
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0)
    )];
  }
  
  next();
});

export const Categoria = mongoose.model<ICategoria>('Categoria', CategoriaSchema);

