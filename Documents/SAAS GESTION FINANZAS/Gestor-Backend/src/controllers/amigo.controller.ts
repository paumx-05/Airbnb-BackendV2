import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { Amigo } from '../models/Amigo.model';
import { User } from '../models/User.model';

// Obtener todos los amigos del usuario
export const getAmigos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    // Solo obtener amigos con estado 'activo' (amigos mutuos)
    const amigos = await Amigo.find({ 
      userId: req.user.userId,
      estado: 'activo'
    }).lean();

    res.status(200).json({
      success: true,
      data: amigos.map(amigo => ({
        _id: amigo._id.toString(),
        userId: amigo.userId.toString(),
        amigoUserId: amigo.amigoUserId.toString(),
        nombre: amigo.nombre,
        email: amigo.email,
        avatar: amigo.avatar,
        estado: amigo.estado,
        fechaAmistad: amigo.fechaAmistad ? amigo.fechaAmistad.toISOString() : undefined,
        createdAt: amigo.createdAt instanceof Date ? amigo.createdAt.toISOString() : amigo.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener amigos'
    });
  }
};

// Obtener un amigo por ID
export const getAmigoById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;

    const amigo = await Amigo.findOne({ _id: id, userId: req.user.userId }).lean();

    if (!amigo) {
      res.status(404).json({
        success: false,
        error: 'Amigo no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        _id: amigo._id.toString(),
        userId: amigo.userId.toString(),
        amigoUserId: amigo.amigoUserId.toString(),
        nombre: amigo.nombre,
        email: amigo.email,
        avatar: amigo.avatar,
        estado: amigo.estado,
        solicitadoPor: amigo.solicitadoPor.toString(),
        fechaAmistad: amigo.fechaAmistad ? amigo.fechaAmistad.toISOString() : undefined,
        createdAt: amigo.createdAt instanceof Date ? amigo.createdAt.toISOString() : amigo.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener amigo'
    });
  }
};

// Buscar amigos por nombre o email
export const searchAmigos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Parámetro de búsqueda requerido'
      });
      return;
    }

    const amigos = await Amigo.find({
      userId: req.user.userId,
      $or: [
        { nombre: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).lean();

    res.status(200).json({
      success: true,
      data: amigos.map(amigo => ({
        _id: amigo._id.toString(),
        userId: amigo.userId.toString(),
        amigoUserId: amigo.amigoUserId.toString(),
        nombre: amigo.nombre,
        email: amigo.email,
        avatar: amigo.avatar,
        estado: amigo.estado,
        fechaAmistad: amigo.fechaAmistad ? amigo.fechaAmistad.toISOString() : undefined,
        createdAt: amigo.createdAt instanceof Date ? amigo.createdAt.toISOString() : amigo.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al buscar amigos'
    });
  }
};

// Obtener amigos por estado
export const getAmigosByEstado = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { estado } = req.params;

    const estadosValidos = ['pendiente', 'activo', 'rechazada', 'bloqueado'];
    if (!estadosValidos.includes(estado)) {
      res.status(400).json({
        success: false,
        error: 'Estado inválido. Debe ser: pendiente, activo, rechazada o bloqueado'
      });
      return;
    }

    const amigos = await Amigo.find({ userId: req.user.userId, estado }).lean();

    res.status(200).json({
      success: true,
      data: amigos.map(amigo => ({
        _id: amigo._id.toString(),
        userId: amigo.userId.toString(),
        amigoUserId: amigo.amigoUserId.toString(),
        nombre: amigo.nombre,
        email: amigo.email,
        avatar: amigo.avatar,
        estado: amigo.estado,
        fechaAmistad: amigo.fechaAmistad ? amigo.fechaAmistad.toISOString() : undefined,
        createdAt: amigo.createdAt instanceof Date ? amigo.createdAt.toISOString() : amigo.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener amigos por estado'
    });
  }
};

// Crear un nuevo amigo
export const createAmigo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { nombre, email, avatar, estado } = req.body;

    // Validar nombre
    if (!nombre || nombre.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'El nombre es requerido'
      });
      return;
    }

    // Validar email
    if (!email) {
      res.status(400).json({
        success: false,
        error: 'El email es requerido'
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Email inválido'
      });
      return;
    }

    // Validar estado si se proporciona
    if (estado) {
      const estadosValidos = ['pendiente', 'activo', 'rechazada', 'bloqueado'];
      if (!estadosValidos.includes(estado)) {
        res.status(400).json({
          success: false,
          error: 'Estado inválido. Debe ser: pendiente, activo, rechazada o bloqueado'
        });
        return;
      }
    }

    // Buscar usuario por email para obtener su ID
    const usuarioDestino = await User.findOne({ 
      email: email.toLowerCase().trim() 
    });

    if (!usuarioDestino) {
      res.status(404).json({
        success: false,
        error: 'El usuario con ese email no existe en el sistema'
      });
      return;
    }

    // Validar que no se esté agregando a uno mismo
    if (usuarioDestino._id.toString() === req.user.userId) {
      res.status(400).json({
        success: false,
        error: 'No puedes agregarte a ti mismo como amigo'
      });
      return;
    }

    // Verificar si ya existe una relación
    const relacionExistente = await Amigo.findOne({
      userId: req.user.userId,
      amigoUserId: usuarioDestino._id
    });

    if (relacionExistente) {
      res.status(409).json({
        success: false,
        error: `Ya existe una relación con este usuario (estado: ${relacionExistente.estado})`
      });
      return;
    }

    // Crear solicitud de amistad (mantener compatibilidad con createAmigo)
    const nuevoAmigo = new Amigo({
      userId: req.user.userId,
      amigoUserId: usuarioDestino._id,
      nombre: nombre.trim(),
      email: email.toLowerCase().trim(),
      avatar: avatar?.trim() || usuarioDestino.avatar,
      estado: estado || 'pendiente',
      solicitadoPor: req.user.userId,
      fechaAmistad: estado === 'activo' ? new Date() : undefined
    });

    await nuevoAmigo.save();

    res.status(201).json({
      success: true,
      data: {
        _id: nuevoAmigo._id.toString(),
        userId: nuevoAmigo.userId.toString(),
        amigoUserId: nuevoAmigo.amigoUserId.toString(),
        nombre: nuevoAmigo.nombre,
        email: nuevoAmigo.email,
        avatar: nuevoAmigo.avatar,
        estado: nuevoAmigo.estado,
        solicitadoPor: nuevoAmigo.solicitadoPor.toString(),
        fechaAmistad: nuevoAmigo.fechaAmistad ? nuevoAmigo.fechaAmistad.toISOString() : undefined,
        createdAt: nuevoAmigo.createdAt.toISOString()
      },
      message: 'Solicitud de amistad creada exitosamente'
    });
  } catch (error) {
    // Manejar error de duplicado del índice único
    if (error instanceof Error && error.message.includes('duplicate key')) {
      res.status(409).json({
        success: false,
        error: 'Ya existe un amigo con ese email'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Error al crear amigo'
    });
  }
};

// Actualizar un amigo existente
export const updateAmigo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;
    const { nombre, email, avatar, estado } = req.body;

    // Buscar amigo
    const amigo = await Amigo.findOne({ _id: id, userId: req.user.userId });

    if (!amigo) {
      res.status(404).json({
        success: false,
        error: 'Amigo no encontrado'
      });
      return;
    }

    // Validar y actualizar nombre
    if (nombre !== undefined) {
      if (!nombre || nombre.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'El nombre no puede estar vacío'
        });
        return;
      }
      amigo.nombre = nombre.trim();
    }

    // Validar y actualizar email
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          error: 'Email inválido'
        });
        return;
      }

      // Verificar si el nuevo email ya existe en otro amigo
      const amigoConEmail = await Amigo.findOne({
        userId: req.user.userId,
        email: email.toLowerCase().trim(),
        _id: { $ne: id }
      });

      if (amigoConEmail) {
        res.status(409).json({
          success: false,
          error: 'Ya existe un amigo con ese email'
        });
        return;
      }

      amigo.email = email.toLowerCase().trim();
    }

    // Actualizar avatar
    if (avatar !== undefined) {
      amigo.avatar = avatar?.trim();
    }

    // Validar y actualizar estado
    if (estado !== undefined) {
      const estadosValidos = ['pendiente', 'activo', 'rechazada', 'bloqueado'];
      if (!estadosValidos.includes(estado)) {
        res.status(400).json({
          success: false,
          error: 'Estado inválido. Debe ser: pendiente, activo, rechazada o bloqueado'
        });
        return;
      }
      amigo.estado = estado;
    }

    await amigo.save();

    res.status(200).json({
      success: true,
      data: {
        _id: amigo._id.toString(),
        userId: amigo.userId.toString(),
        amigoUserId: amigo.amigoUserId.toString(),
        nombre: amigo.nombre,
        email: amigo.email,
        avatar: amigo.avatar,
        estado: amigo.estado,
        solicitadoPor: amigo.solicitadoPor.toString(),
        fechaAmistad: amigo.fechaAmistad ? amigo.fechaAmistad.toISOString() : undefined,
        createdAt: amigo.createdAt.toISOString()
      },
      message: 'Amigo actualizado exitosamente'
    });
  } catch (error) {
    // Manejar error de duplicado del índice único
    if (error instanceof Error && error.message.includes('duplicate key')) {
      res.status(409).json({
        success: false,
        error: 'Ya existe un amigo con ese email'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Error al actualizar amigo'
    });
  }
};

// Actualizar estado de un amigo
export const updateEstadoAmigo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;
    const { estado } = req.body;

    // Validar estado
    if (!estado) {
      res.status(400).json({
        success: false,
        error: 'El estado es requerido'
      });
      return;
    }

    const estadosValidos = ['pendiente', 'activo', 'rechazada', 'bloqueado'];
    if (!estadosValidos.includes(estado)) {
      res.status(400).json({
        success: false,
        error: 'Estado inválido. Debe ser: pendiente, activo, rechazada o bloqueado'
      });
      return;
    }

    // Buscar y actualizar amigo
    const amigo = await Amigo.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { estado },
      { new: true }
    );

    if (!amigo) {
      res.status(404).json({
        success: false,
        error: 'Amigo no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        _id: amigo._id.toString(),
        userId: amigo.userId.toString(),
        nombre: amigo.nombre,
        email: amigo.email,
        avatar: amigo.avatar,
        estado: amigo.estado,
        solicitadoPor: amigo.solicitadoPor.toString(),
        fechaAmistad: amigo.fechaAmistad ? amigo.fechaAmistad.toISOString() : undefined,
        createdAt: amigo.createdAt.toISOString()
      },
      message: 'Estado actualizado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al actualizar estado'
    });
  }
};

// Eliminar un amigo
export const deleteAmigo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;

    const amigo = await Amigo.findOneAndDelete({ _id: id, userId: req.user.userId });

    if (!amigo) {
      res.status(404).json({
        success: false,
        error: 'Amigo no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Amigo eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al eliminar amigo'
    });
  }
};

// Buscar usuarios del sistema (no amigos)
export const searchUsuarios = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Parámetro de búsqueda requerido'
      });
      return;
    }

    // Buscar usuarios por nombre o email (excluyendo al usuario actual)
    const usuarios = await User.find({
      _id: { $ne: req.user.userId },
      $or: [
        { nombre: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
    .select('_id nombre email avatar')
    .limit(20)
    .lean();

    // Verificar estado de amistad con cada usuario
    const usuariosConEstado = await Promise.all(
      usuarios.map(async (usuario) => {
        const amistad = await Amigo.findOne({
          userId: req.user.userId,
          amigoUserId: usuario._id
        }).lean();

        return {
          _id: usuario._id.toString(),
          nombre: usuario.nombre,
          email: usuario.email,
          avatar: usuario.avatar,
          estadoAmistad: amistad ? amistad.estado : null,
          esAmigo: amistad?.estado === 'activo'
        };
      })
    );

    res.status(200).json({
      success: true,
      data: usuariosConEstado
    });
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error al buscar usuarios'
    });
  }
};

// Enviar solicitud de amistad
export const enviarSolicitud = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { amigoUserId } = req.body;

    if (!amigoUserId) {
      res.status(400).json({
        success: false,
        error: 'El ID del usuario amigo es requerido'
      });
      return;
    }

    // Validar que amigoUserId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(amigoUserId)) {
      res.status(400).json({
        success: false,
        error: 'ID de usuario inválido'
      });
      return;
    }

    // Validar que no se esté enviando solicitud a uno mismo
    if (amigoUserId === req.user.userId) {
      res.status(400).json({
        success: false,
        error: 'No puedes enviar una solicitud de amistad a ti mismo'
      });
      return;
    }

    // Verificar que el usuario destinatario existe
    const usuarioDestino = await User.findById(amigoUserId);
    if (!usuarioDestino) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }

    // Verificar si ya existe una relación
    const relacionExistente = await Amigo.findOne({
      userId: req.user.userId,
      amigoUserId: amigoUserId
    });

    if (relacionExistente) {
      res.status(409).json({
        success: false,
        error: `Ya existe una relación con este usuario (estado: ${relacionExistente.estado})`
      });
      return;
    }

    // Crear solicitud de amistad
    const nuevaSolicitud = new Amigo({
      userId: req.user.userId,
      amigoUserId: amigoUserId,
      nombre: usuarioDestino.nombre,
      email: usuarioDestino.email,
      avatar: usuarioDestino.avatar,
      estado: 'pendiente',
      solicitadoPor: req.user.userId
    });

    await nuevaSolicitud.save();

    res.status(201).json({
      success: true,
      data: {
        _id: nuevaSolicitud._id.toString(),
        userId: nuevaSolicitud.userId.toString(),
        amigoUserId: nuevaSolicitud.amigoUserId.toString(),
        nombre: nuevaSolicitud.nombre,
        email: nuevaSolicitud.email,
        avatar: nuevaSolicitud.avatar,
        estado: nuevaSolicitud.estado,
        solicitadoPor: nuevaSolicitud.solicitadoPor.toString(),
        createdAt: nuevaSolicitud.createdAt.toISOString()
      },
      message: 'Solicitud de amistad enviada exitosamente'
    });
  } catch (error) {
    console.error('Error al enviar solicitud:', error);
    if (error instanceof Error && error.message.includes('duplicate key')) {
      res.status(409).json({
        success: false,
        error: 'Ya existe una relación con este usuario'
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: 'Error al enviar solicitud de amistad'
    });
  }
};

// Obtener solicitudes recibidas
export const getSolicitudesRecibidas = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    // Buscar solicitudes donde el usuario actual es el destinatario y estado es 'pendiente'
    const solicitudes = await Amigo.find({
      amigoUserId: req.user.userId,
      estado: 'pendiente'
    })
    .populate('userId', 'nombre email avatar')
    .populate('solicitadoPor', 'nombre email avatar')
    .sort({ createdAt: -1 })
    .lean();

    res.status(200).json({
      success: true,
      data: solicitudes.map(sol => ({
        _id: sol._id.toString(),
        solicitante: {
          _id: (sol.userId as any)._id.toString(),
          nombre: (sol.userId as any).nombre,
          email: (sol.userId as any).email,
          avatar: (sol.userId as any).avatar
        },
        estado: sol.estado,
        createdAt: sol.createdAt instanceof Date ? sol.createdAt.toISOString() : sol.createdAt
      }))
    });
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener solicitudes'
    });
  }
};

// Aceptar solicitud de amistad
export const aceptarSolicitud = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;

    // Buscar la solicitud donde el usuario actual es el destinatario
    const solicitud = await Amigo.findOne({
      _id: id,
      amigoUserId: req.user.userId,
      estado: 'pendiente'
    }).populate('userId', 'nombre email avatar');

    if (!solicitud) {
      res.status(404).json({
        success: false,
        error: 'Solicitud no encontrada o ya procesada'
      });
      return;
    }

    // Actualizar la solicitud original a 'activo'
    solicitud.estado = 'activo';
    solicitud.fechaAmistad = new Date();
    await solicitud.save();

    // Crear la relación inversa (el otro usuario también tiene al usuario actual como amigo)
    const usuarioSolicitante = await User.findById(solicitud.userId);
    if (usuarioSolicitante) {
      // Verificar si ya existe la relación inversa
      const relacionInversaExistente = await Amigo.findOne({
        userId: req.user.userId,
        amigoUserId: solicitud.userId
      });

      if (!relacionInversaExistente) {
        const relacionInversa = new Amigo({
          userId: req.user.userId,
          amigoUserId: solicitud.userId,
          nombre: usuarioSolicitante.nombre,
          email: usuarioSolicitante.email,
          avatar: usuarioSolicitante.avatar,
          estado: 'activo',
          solicitadoPor: solicitud.solicitadoPor,
          fechaAmistad: new Date()
        });

        await relacionInversa.save();
      }
    }

    res.status(200).json({
      success: true,
      data: {
        _id: solicitud._id.toString(),
        estado: solicitud.estado,
        fechaAmistad: solicitud.fechaAmistad.toISOString()
      },
      message: 'Solicitud de amistad aceptada exitosamente'
    });
  } catch (error) {
    console.error('Error al aceptar solicitud:', error);
    res.status(500).json({
      success: false,
      error: 'Error al aceptar solicitud de amistad'
    });
  }
};

// Rechazar solicitud de amistad
export const rechazarSolicitud = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;

    // Buscar y actualizar la solicitud
    const solicitud = await Amigo.findOneAndUpdate(
      {
        _id: id,
        amigoUserId: req.user.userId,
        estado: 'pendiente'
      },
      {
        estado: 'rechazada'
      },
      { new: true }
    );

    if (!solicitud) {
      res.status(404).json({
        success: false,
        error: 'Solicitud no encontrada o ya procesada'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Solicitud de amistad rechazada'
    });
  } catch (error) {
    console.error('Error al rechazar solicitud:', error);
    res.status(500).json({
      success: false,
      error: 'Error al rechazar solicitud de amistad'
    });
  }
};


