import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas de usuarios requieren autenticación
router.use(authenticate);

// GET /api/users/profile - Obtener perfil del usuario autenticado
router.get('/profile', getProfile);

// PUT /api/users/profile - Actualizar perfil del usuario autenticado
router.put('/profile', updateProfile);

export { router as usersRoutes };

