import { Router } from 'express';
import {
  getExamples,
  getExampleById,
  createExample,
  updateExample,
  deleteExample
} from '../controllers/example.controller';

const router = Router();

// GET /api/example - Obtener todos los ejemplos
router.get('/', getExamples);

// GET /api/example/:id - Obtener un ejemplo por ID
router.get('/:id', getExampleById);

// POST /api/example - Crear un nuevo ejemplo
router.post('/', createExample);

// PUT /api/example/:id - Actualizar un ejemplo
router.put('/:id', updateExample);

// DELETE /api/example/:id - Eliminar un ejemplo
router.delete('/:id', deleteExample);

export { router as exampleRoutes };

