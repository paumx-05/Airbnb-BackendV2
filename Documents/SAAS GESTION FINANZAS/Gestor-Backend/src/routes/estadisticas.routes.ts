import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as estadisticasController from '../controllers/estadisticas.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/estadisticas/resumen - Obtener resumen de estadísticas
router.get('/resumen', estadisticasController.getResumenEstadisticas);

// GET /api/estadisticas/tendencias - Obtener tendencias temporales
router.get('/tendencias', estadisticasController.getTendenciasTemporales);

// GET /api/estadisticas/categorias - Obtener análisis por categorías
router.get('/categorias', estadisticasController.getAnalisisCategorias);

// GET /api/estadisticas/comportamiento - Obtener métricas de comportamiento
router.get('/comportamiento', estadisticasController.getMetricasComportamiento);

export { router as estadisticasRoutes };

