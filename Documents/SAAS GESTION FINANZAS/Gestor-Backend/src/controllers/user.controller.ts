import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/User.model';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }

    // Retornar usuario sin contraseña
    const userWithoutPassword = {
      id: user._id.toString(),
      email: user.email,
      nombre: user.nombre,
      descripcion: user.descripcion,
      avatar: user.avatar,
      role: user.role,
      fechaCreacion: user.fechaCreacion
    };

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener perfil'
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { nombre, descripcion, avatar } = req.body;

    // Validar que al menos un campo esté presente
    if (!nombre && descripcion === undefined && !avatar) {
      res.status(400).json({
        success: false,
        error: 'Al menos un campo debe ser actualizado'
      });
      return;
    }

    // Buscar usuario
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }

    // Actualizar campos
    if (nombre) user.nombre = nombre;
    if (descripcion !== undefined) user.descripcion = descripcion;
    if (avatar) user.avatar = avatar;

    await user.save();

    // Retornar usuario sin contraseña
    const userWithoutPassword = {
      id: user._id.toString(),
      email: user.email,
      nombre: user.nombre,
      descripcion: user.descripcion,
      avatar: user.avatar,
      role: user.role,
      fechaCreacion: user.fechaCreacion
    };

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
      message: 'Perfil actualizado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al actualizar perfil'
    });
  }
};

