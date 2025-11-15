import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as chatController from '../controllers/chat.controller';

const router = Router();

// Todas las rutas de chat requieren autenticación
router.use(authenticate);

// GET /api/chat/amigos - Obtener lista de chats con último mensaje
router.get('/amigos', chatController.getChatsList);

// GET /api/chat/:amigoId/mensajes - Obtener mensajes de un chat específico
router.get('/:amigoId/mensajes', chatController.getMensajesByAmigo);

// POST /api/chat/:amigoId/mensajes - Enviar mensaje en el chat
router.post('/:amigoId/mensajes', chatController.createMensaje);

// PUT /api/chat/:amigoId/leer - Marcar mensajes como leídos
router.put('/:amigoId/leer', chatController.markAsLeido);

export { router as chatRoutes };

