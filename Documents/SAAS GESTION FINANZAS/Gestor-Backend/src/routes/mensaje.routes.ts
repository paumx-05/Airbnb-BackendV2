import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as mensajeController from '../controllers/mensaje.controller';

const router = Router();

// Todas las rutas de mensajes requieren autenticación
router.use(authenticate);

// GET /api/mensajes - Obtener todos los mensajes (query: ?leido=true/false)
router.get('/', mensajeController.getMensajes);

// GET /api/mensajes/:id - Obtener mensaje por ID
router.get('/:id', mensajeController.getMensajeById);

// POST /api/mensajes - Crear nuevo mensaje
router.post('/', mensajeController.createMensaje);

// PUT /api/mensajes/leer-todos - Marcar todos como leídos (debe ir antes de /:id/leido)
router.put('/leer-todos', mensajeController.markAllAsLeidos);

// PUT /api/mensajes/:id/leido - Marcar como leído
router.put('/:id/leido', mensajeController.markAsLeido);

// DELETE /api/mensajes/:id - Eliminar mensaje
router.delete('/:id', mensajeController.deleteMensaje);

// DELETE /api/mensajes - Eliminar todos los mensajes
router.delete('/', mensajeController.deleteAllMensajes);

export { router as mensajeRoutes };

