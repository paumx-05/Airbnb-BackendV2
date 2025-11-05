import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User.model';
import { generateToken } from '../utils/jwt.utils';
import { AuthRequest } from '../middleware/auth.middleware';
import { generateResetToken, verifyResetToken, deleteResetToken } from '../services/resetToken.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, nombre, descripcion } = req.body;

    // Validaciones básicas
    if (!email || !password || !nombre) {
      res.status(400).json({
        success: false,
        error: 'Email, contraseña y nombre son requeridos'
      });
      return;
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Email inválido'
      });
      return;
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
      return;
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'El email ya está registrado'
      });
      return;
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario en MongoDB
    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      nombre,
      descripcion,
      role: 'regular'
    });

    // Generar token
    const token = generateToken({
      userId: newUser._id.toString(),
      email: newUser.email
    });

    // Retornar usuario sin contraseña
    const userWithoutPassword = {
      id: newUser._id.toString(),
      email: newUser.email,
      nombre: newUser.nombre,
      descripcion: newUser.descripcion,
      avatar: newUser.avatar,
      role: newUser.role,
      fechaCreacion: newUser.fechaCreacion
    };

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'Usuario registrado exitosamente'
    });
  } catch (error: any) {
    console.error('Error en register:', error);
    
    // Error de duplicado (email único)
    if (error.code === 11000 || error.keyPattern?.email) {
      res.status(409).json({
        success: false,
        error: 'El email ya está registrado'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Error al registrar usuario',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos'
      });
      return;
    }

    // Buscar usuario en MongoDB
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
      return;
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
      return;
    }

    // Generar token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email
    });

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
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'Login exitoso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al iniciar sesión'
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
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
      error: 'Error al obtener información del usuario'
    });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  // En implementación con JWT, el logout se maneja en el frontend
  // eliminando el token. Aquí solo confirmamos.
  res.status(200).json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Validar email
    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Email es requerido'
      });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Email inválido'
      });
      return;
    }

    // Buscar usuario en MongoDB
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Debug: mostrar si se encontró el usuario
    console.log(`[Forgot Password] Email solicitado: ${email}`);
    console.log(`[Forgot Password] Usuario encontrado: ${user ? 'Sí' : 'No'}`);

    // Si el usuario existe y está activo, generar token
    if (user) {
      // Generar token de reset y guardarlo en MongoDB
      const resetToken = await generateResetToken(user._id, user.email);

      // Construir enlace de reset
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:4000'}/reset-password?token=${resetToken}`;

      // SIEMPRE mostrar el token en consola (para debugging y desarrollo)
      console.log('\n========================================');
      console.log('🔗 TOKEN DE RESET PASSWORD');
      console.log('========================================');
      console.log('Email:', user.email);
      console.log('Token:', resetToken);
      console.log('Enlace completo:', resetLink);
      console.log('========================================\n');
      
      // Guardar en archivo para debugging
      const fs = require('fs');
      try {
        fs.writeFileSync('reset-token.txt', `Email: ${user.email}\nToken: ${resetToken}\nEnlace: ${resetLink}`);
        console.log('✅ Token guardado en reset-token.txt');
      } catch (fileError) {
        console.warn('⚠️ No se pudo guardar token en archivo:', fileError);
      }

      // TODO: Aquí se enviaría el email en producción
      // await sendResetPasswordEmail(user.email, resetLink);

      // En desarrollo, devolver el token en la respuesta
      // Nota: El token SIEMPRE se muestra en consola arriba
      const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
      
      res.status(200).json({
        success: true,
        message: 'Si el email existe, se ha enviado un enlace para restablecer la contraseña',
        ...(isDevelopment && {
          resetToken: resetToken,
          resetLink: resetLink,
          note: '⚠️ En producción, este token se enviaría por email. Ver consola del servidor para el token.'
        })
      });
    } else {
      // Usuario no existe, pero devolvemos el mismo mensaje por seguridad
      // Esto evita que se descubran emails registrados
      res.status(200).json({
        success: true,
        message: 'Si el email existe, se ha enviado un enlace para restablecer la contraseña'
      });
    }
  } catch (error) {
    console.error('Error en forgotPassword:', error);
    res.status(500).json({
      success: false,
      error: 'Error al procesar la solicitud'
    });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    // Validar datos requeridos
    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'Token y nueva contraseña son requeridos'
      });
      return;
    }

    // Validar longitud de contraseña
    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
      return;
    }

    // Decodificar token si viene en URL (puede tener caracteres codificados)
    const cleanToken = decodeURIComponent(token);

    // Verificar token en MongoDB
    const email = await verifyResetToken(cleanToken);
    
    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Token inválido o expirado'
      });
      return;
    }

    // Buscar usuario en MongoDB
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }

    // Actualizar contraseña en MongoDB
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Eliminar token usado (ya no se puede reutilizar)
    await deleteResetToken(cleanToken);

    res.status(200).json({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({
      success: false,
      error: 'Error al restablecer la contraseña'
    });
  }
};

