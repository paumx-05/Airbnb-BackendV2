import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Mensaje } from '../models/Mensaje.model';

// Obtener todos los mensajes del usuario
export const getMensajes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { leido } = req.query;
    
    // Construir filtro
    const filter: any = { userId: req.user.userId };
    
    // Filtrar por estado leído si se proporciona
    if (leido !== undefined) {
      const leidoValue = leido === 'true' || leido === true;
      filter.leido = leidoValue;
    }

    // Obtener mensajes ordenados por fecha descendente (más recientes primero)
    const mensajes = await Mensaje.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: mensajes.map(mensaje => ({
        _id: mensaje._id.toString(),
        userId: mensaje.userId.toString(),
        remitente: mensaje.remitente,
        asunto: mensaje.asunto,
        contenido: mensaje.contenido,
        leido: mensaje.leido,
        createdAt: mensaje.createdAt instanceof Date 
          ? mensaje.createdAt.toISOString() 
          : mensaje.createdAt
      }))
    });
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener mensajes'
    });
  }
};

// Obtener mensaje específico por ID
export const getMensajeById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;

    // Buscar mensaje que pertenezca al usuario
    const mensaje = await Mensaje.findOne({ 
      _id: id, 
      userId: req.user.userId 
    }).lean();

    if (!mensaje) {
      res.status(404).json({
        success: false,
        error: 'Mensaje no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        _id: mensaje._id.toString(),
        userId: mensaje.userId.toString(),
        remitente: mensaje.remitente,
        asunto: mensaje.asunto,
        contenido: mensaje.contenido,
        leido: mensaje.leido,
        createdAt: mensaje.createdAt instanceof Date 
          ? mensaje.createdAt.toISOString() 
          : mensaje.createdAt
      }
    });
  } catch (error) {
    console.error('Error al obtener mensaje:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener mensaje'
    });
  }
};

// Crear nuevo mensaje
export const createMensaje = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { remitente, asunto, contenido, leido } = req.body;

    // Validar campos requeridos
    if (!remitente || typeof remitente !== 'string' || remitente.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'El remitente es requerido y debe ser un string no vacío'
      });
      return;
    }

    if (!asunto || typeof asunto !== 'string' || asunto.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'El asunto es requerido y debe ser un string no vacío'
      });
      return;
    }

    if (!contenido || typeof contenido !== 'string' || contenido.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'El contenido es requerido y debe ser un string no vacío'
      });
      return;
    }

    // Validar leido si se proporciona
    let leidoValue = false;
    if (leido !== undefined) {
      if (typeof leido !== 'boolean') {
        res.status(400).json({
          success: false,
          error: 'El campo leido debe ser un boolean'
        });
        return;
      }
      leidoValue = leido;
    }

    // Crear nuevo mensaje
    const nuevoMensaje = new Mensaje({
      userId: req.user.userId,
      remitente: remitente.trim(),
      asunto: asunto.trim(),
      contenido: contenido.trim(),
      leido: leidoValue
    });

    await nuevoMensaje.save();

    res.status(201).json({
      success: true,
      data: {
        _id: nuevoMensaje._id.toString(),
        userId: nuevoMensaje.userId.toString(),
        remitente: nuevoMensaje.remitente,
        asunto: nuevoMensaje.asunto,
        contenido: nuevoMensaje.contenido,
        leido: nuevoMensaje.leido,
        createdAt: nuevoMensaje.createdAt.toISOString()
      },
      message: 'Mensaje creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear mensaje:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear mensaje'
    });
  }
};

// Marcar mensaje como leído
export const markAsLeido = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;

    // Buscar mensaje que pertenezca al usuario
    const mensaje = await Mensaje.findOne({ 
      _id: id, 
      userId: req.user.userId 
    });

    if (!mensaje) {
      res.status(404).json({
        success: false,
        error: 'Mensaje no encontrado'
      });
      return;
    }

    // Marcar como leído
    mensaje.leido = true;
    await mensaje.save();

    res.status(200).json({
      success: true,
      data: {
        _id: mensaje._id.toString(),
        userId: mensaje.userId.toString(),
        remitente: mensaje.remitente,
        asunto: mensaje.asunto,
        contenido: mensaje.contenido,
        leido: mensaje.leido,
        createdAt: mensaje.createdAt.toISOString()
      },
      message: 'Mensaje marcado como leído'
    });
  } catch (error) {
    console.error('Error al marcar mensaje como leído:', error);
    res.status(500).json({
      success: false,
      error: 'Error al marcar mensaje como leído'
    });
  }
};

// Marcar todos los mensajes como leídos
export const markAllAsLeidos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    // Actualizar todos los mensajes no leídos del usuario
    const result = await Mensaje.updateMany(
      { 
        userId: req.user.userId, 
        leido: false 
      },
      { 
        $set: { leido: true } 
      }
    );

    res.status(200).json({
      success: true,
      data: {
        mensajesActualizados: result.modifiedCount
      },
      message: `${result.modifiedCount} mensaje(s) marcado(s) como leído(s)`
    });
  } catch (error) {
    console.error('Error al marcar todos los mensajes como leídos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al marcar todos los mensajes como leídos'
    });
  }
};

// Eliminar mensaje por ID
export const deleteMensaje = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;

    // Eliminar mensaje que pertenezca al usuario
    const mensaje = await Mensaje.findOneAndDelete({ 
      _id: id, 
      userId: req.user.userId 
    });

    if (!mensaje) {
      res.status(404).json({
        success: false,
        error: 'Mensaje no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Mensaje eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar mensaje:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar mensaje'
    });
  }
};

// Eliminar todos los mensajes del usuario
export const deleteAllMensajes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    // Eliminar todos los mensajes del usuario
    const result = await Mensaje.deleteMany({ 
      userId: req.user.userId 
    });

    res.status(200).json({
      success: true,
      data: {
        mensajesEliminados: result.deletedCount
      },
      message: `${result.deletedCount} mensaje(s) eliminado(s) exitosamente`
    });
  } catch (error) {
    console.error('Error al eliminar todos los mensajes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar todos los mensajes'
    });
  }
};

