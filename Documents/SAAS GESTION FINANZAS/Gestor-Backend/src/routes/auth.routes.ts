import { Router } from 'express';
import { register, login, logout, getMe, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/register - Registro de nuevos usuarios
router.post('/register', register);

// POST /api/auth/login - Inicio de sesión
router.post('/login', login);

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', logout);

// GET /api/auth/me - Obtener información del usuario autenticado
router.get('/me', authenticate, getMe);

// POST /api/auth/forgot-password - Solicitar reset de contraseña
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password - Restablecer contraseña con token
router.post('/reset-password', resetPassword);

export { router as authRoutes };

