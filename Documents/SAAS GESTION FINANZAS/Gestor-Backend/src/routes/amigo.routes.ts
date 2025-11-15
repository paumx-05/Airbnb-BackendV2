import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as amigoController from '../controllers/amigo.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas específicas deben ir ANTES de las rutas con parámetros dinámicos
// GET /api/amigos - Obtener todos los amigos activos
router.get('/', amigoController.getAmigos);

// GET /api/amigos/usuarios/search?q= - Buscar usuarios del sistema (NUEVO)
router.get('/usuarios/search', amigoController.searchUsuarios);

// GET /api/amigos/search?q= - Buscar entre tus amigos
router.get('/search', amigoController.searchAmigos);

// GET /api/amigos/solicitudes - Obtener solicitudes recibidas (NUEVO)
router.get('/solicitudes', amigoController.getSolicitudesRecibidas);

// GET /api/amigos/estado/:estado - Obtener amigos por estado
router.get('/estado/:estado', amigoController.getAmigosByEstado);

// POST /api/amigos/solicitud - Enviar solicitud de amistad (NUEVO)
router.post('/solicitud', amigoController.enviarSolicitud);

// POST /api/amigos - Crear solicitud (mantener por compatibilidad)
router.post('/', amigoController.createAmigo);

// PUT /api/amigos/solicitud/:id/aceptar - Aceptar solicitud (NUEVO)
router.put('/solicitud/:id/aceptar', amigoController.aceptarSolicitud);

// PUT /api/amigos/solicitud/:id/rechazar - Rechazar solicitud (NUEVO)
router.put('/solicitud/:id/rechazar', amigoController.rechazarSolicitud);

// PUT /api/amigos/:id/estado - Actualizar estado de un amigo
router.put('/:id/estado', amigoController.updateEstadoAmigo);

// PUT /api/amigos/:id - Actualizar un amigo existente
router.put('/:id', amigoController.updateAmigo);

// GET /api/amigos/:id - Obtener un amigo por ID
router.get('/:id', amigoController.getAmigoById);

// DELETE /api/amigos/:id - Eliminar un amigo
router.delete('/:id', amigoController.deleteAmigo);

export { router as amigoRoutes };


