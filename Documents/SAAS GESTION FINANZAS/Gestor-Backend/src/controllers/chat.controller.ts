import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { MensajeChat } from '../models/MensajeChat.model';
import { Amigo } from '../models/Amigo.model';
import { User } from '../models/User.model';

// Obtener mensajes de un chat específico
export const getMensajesByAmigo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { amigoId } = req.params;

    // Validar que el amigoId sea válido
    if (!mongoose.Types.ObjectId.isValid(amigoId)) {
      res.status(400).json({
        success: false,
        error: 'ID de amigo inválido'
      });
      return;
    }

    // Verificar que el amigo existe y pertenece al usuario
    const amigo = await Amigo.findOne({ 
      _id: amigoId, 
      userId: req.user.userId 
    });

    if (!amigo) {
      res.status(404).json({
        success: false,
        error: 'Amigo no encontrado'
      });
      return;
    }

    // Obtener mensajes donde el usuario es remitente o destinatario
    // Buscar mensajes basándose en la relación de amistad (userId y amigoUserId)
    // en lugar de solo amigoId, para que funcione desde ambas perspectivas
    const mensajes = await MensajeChat.find({
      $or: [
        // Mensajes donde el usuario actual es remitente y el amigo es destinatario
        {
          remitenteId: req.user!.userId,
          destinatarioId: amigo.amigoUserId
        },
        // Mensajes donde el usuario actual es destinatario y el amigo es remitente
        {
          remitenteId: amigo.amigoUserId,
          destinatarioId: req.user!.userId
        }
      ]
    })
    .sort({ createdAt: 1 }) // Ordenar por fecha ascendente (más antiguos primero)
    .lean();

    res.status(200).json({
      success: true,
      data: mensajes.map(mensaje => ({
        _id: mensaje._id.toString(),
        remitenteId: mensaje.remitenteId.toString(),
        destinatarioId: mensaje.destinatarioId.toString(),
        amigoId: mensaje.amigoId.toString(),
        contenido: mensaje.contenido,
        esSistema: mensaje.esSistema,
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

// Crear nuevo mensaje en el chat
export const createMensaje = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { amigoId } = req.params;
    const { contenido, esSistema } = req.body;

    // Validar amigoId
    if (!mongoose.Types.ObjectId.isValid(amigoId)) {
      res.status(400).json({
        success: false,
        error: 'ID de amigo inválido'
      });
      return;
    }

    // Validar contenido
    if (!contenido || typeof contenido !== 'string' || contenido.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'El contenido es requerido y debe ser un string no vacío'
      });
      return;
    }

    // Verificar que el amigo existe y pertenece al usuario
    const amigo = await Amigo.findOne({ 
      _id: amigoId, 
      userId: req.user.userId 
    });

    if (!amigo) {
      res.status(404).json({
        success: false,
        error: 'Amigo no encontrado'
      });
      return;
    }

    // Verificar que ambos usuarios se tienen mutuamente como amigos activos
    const amistadMutua = await Amigo.findOne({
      userId: req.user.userId,
      amigoUserId: amigo.amigoUserId,
      estado: 'activo'
    });

    if (!amistadMutua) {
      res.status(403).json({
        success: false,
        error: 'No puedes enviar mensajes a este usuario. Primero deben ser amigos mutuos con estado activo.'
      });
      return;
    }

    // Buscar el usuario destinatario por su email
    // Normalizar email: trim y lowercase para coincidir con el modelo User
    // El modelo Amigo ya tiene lowercase: true y trim: true, pero por seguridad lo normalizamos de nuevo
    const emailNormalizado = amigo.email.trim().toLowerCase();
    
    // Debug: Log para ver qué email estamos buscando
    console.log(`[Chat] Buscando usuario destinatario. Email normalizado: "${emailNormalizado}", Email del amigo (raw): "${amigo.email}"`);
    
    // Buscar usuario con múltiples estrategias:
    // 1. Búsqueda exacta normalizada
    // 2. Búsqueda case-insensitive con regex (por si hay algún problema de normalización en BD)
    let destinatario = await User.findOne({ 
      email: emailNormalizado 
    });

    // Si no se encuentra, intentar búsqueda case-insensitive con regex
    if (!destinatario) {
      const emailRegex = new RegExp(`^${emailNormalizado.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      destinatario = await User.findOne({ 
        email: { $regex: emailRegex }
      });
    }

    // Si aún no se encuentra, intentar todas las variantes posibles
    if (!destinatario) {
      destinatario = await User.findOne({ 
        $or: [
          { email: emailNormalizado },
          { email: amigo.email.trim().toLowerCase() },
          { email: amigo.email.toLowerCase() },
          { email: amigo.email.trim() },
          { email: amigo.email }
        ]
      });
    }

    if (!destinatario) {
      console.error(`[Chat] Usuario destinatario no encontrado. Email buscado: "${emailNormalizado}", Email del amigo: "${amigo.email}"`);
      console.error(`[Chat] Usuario autenticado: ${req.user.userId}, Amigo ID: ${amigoId}`);
      
      // Intentar buscar todos los usuarios para debug
      const todosUsuarios = await User.find({}, 'email _id').limit(20).lean();
      console.error(`[Chat] Usuarios en BD (primeros 20):`, todosUsuarios.map(u => ({ email: u.email, id: u._id })));
      
      // Buscar si hay algún usuario con email similar
      const usuariosSimilares = await User.find({
        email: { $regex: emailNormalizado.split('@')[0], $options: 'i' }
      }, 'email').limit(5).lean();
      
      if (usuariosSimilares.length > 0) {
        console.error(`[Chat] Usuarios con email similar encontrados:`, usuariosSimilares.map(u => u.email));
      }
      
      res.status(404).json({
        success: false,
        error: `El usuario destinatario no existe en el sistema. Email buscado: ${emailNormalizado}`,
        debug: {
          emailBuscado: emailNormalizado,
          emailAmigo: amigo.email,
          usuariosEnBD: todosUsuarios.length,
          usuariosSimilares: usuariosSimilares.map(u => u.email)
        }
      });
      return;
    }
    
    console.log(`[Chat] Usuario destinatario encontrado. Email: "${destinatario.email}", ID: ${destinatario._id}`);

    // Validar que no se esté enviando un mensaje a sí mismo
    if (destinatario._id.toString() === req.user.userId) {
      res.status(400).json({
        success: false,
        error: 'No puedes enviar un mensaje a ti mismo'
      });
      return;
    }

    // Crear nuevo mensaje
    const nuevoMensaje = new MensajeChat({
      remitenteId: req.user.userId,
      destinatarioId: destinatario._id,
      amigoId: amigoId,
      contenido: contenido.trim(),
      esSistema: esSistema || false
    });

    await nuevoMensaje.save();

    res.status(201).json({
      success: true,
      data: {
        _id: nuevoMensaje._id.toString(),
        remitenteId: nuevoMensaje.remitenteId.toString(),
        destinatarioId: nuevoMensaje.destinatarioId.toString(),
        amigoId: nuevoMensaje.amigoId.toString(),
        contenido: nuevoMensaje.contenido,
        esSistema: nuevoMensaje.esSistema,
        leido: nuevoMensaje.leido,
        createdAt: nuevoMensaje.createdAt.toISOString()
      },
      message: 'Mensaje enviado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear mensaje:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear mensaje'
    });
  }
};

// Marcar mensajes como leídos
export const markAsLeido = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { amigoId } = req.params;

    // Validar amigoId
    if (!mongoose.Types.ObjectId.isValid(amigoId)) {
      res.status(400).json({
        success: false,
        error: 'ID de amigo inválido'
      });
      return;
    }

    // Verificar que el amigo existe y pertenece al usuario
    const amigo = await Amigo.findOne({ 
      _id: amigoId, 
      userId: req.user.userId 
    });

    if (!amigo) {
      res.status(404).json({
        success: false,
        error: 'Amigo no encontrado'
      });
      return;
    }

    // Marcar como leídos los mensajes donde el usuario es destinatario
    // Buscar basándose en la relación de amistad en lugar de solo amigoId
    const result = await MensajeChat.updateMany(
      {
        remitenteId: amigo.amigoUserId,
        destinatarioId: req.user.userId,
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
    console.error('Error al marcar mensajes como leídos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al marcar mensajes como leídos'
    });
  }
};

// Obtener lista de chats con último mensaje
export const getChatsList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    // Obtener todos los amigos del usuario (solo activos para el chat)
    const amigos = await Amigo.find({ 
      userId: req.user.userId,
      estado: 'activo'
    }).lean();

    // Para cada amigo, obtener el último mensaje y contar no leídos
    const chatsList = await Promise.all(
      amigos.map(async (amigo) => {
        // Obtener último mensaje basándose en la relación de amistad
        const ultimoMensaje = await MensajeChat.findOne({
          $or: [
            {
              remitenteId: req.user!.userId,
              destinatarioId: amigo.amigoUserId
            },
            {
              remitenteId: amigo.amigoUserId,
              destinatarioId: req.user!.userId
            }
          ]
        })
        .sort({ createdAt: -1 })
        .lean();

        // Contar mensajes no leídos donde el usuario es destinatario
        const noLeidos = await MensajeChat.countDocuments({
          remitenteId: amigo.amigoUserId,
          destinatarioId: req.user!.userId,
          leido: false
        });

        return {
          amigoId: amigo._id.toString(),
          amigoNombre: amigo.nombre,
          amigoEmail: amigo.email,
          ultimoMensaje: ultimoMensaje ? {
            contenido: ultimoMensaje.contenido,
            fecha: ultimoMensaje.createdAt instanceof Date 
              ? ultimoMensaje.createdAt.toISOString() 
              : ultimoMensaje.createdAt,
            esSistema: ultimoMensaje.esSistema
          } : null,
          noLeidos
        };
      })
    );

    // Ordenar por fecha del último mensaje (más recientes primero)
    chatsList.sort((a, b) => {
      if (!a.ultimoMensaje && !b.ultimoMensaje) return 0;
      if (!a.ultimoMensaje) return 1;
      if (!b.ultimoMensaje) return -1;
      return new Date(b.ultimoMensaje.fecha).getTime() - new Date(a.ultimoMensaje.fecha).getTime();
    });

    res.status(200).json({
      success: true,
      data: chatsList
    });
  } catch (error) {
    console.error('Error al obtener lista de chats:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener lista de chats'
    });
  }
};

