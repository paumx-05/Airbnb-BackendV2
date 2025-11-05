import crypto from 'crypto';
import { ResetToken } from '../models/ResetToken.model';
import mongoose from 'mongoose';

/**
 * Genera un token seguro de reset de contraseña
 * @param userId - ID del usuario
 * @param email - Email del usuario
 * @returns Token generado
 */
export const generateResetToken = async (
  userId: mongoose.Types.ObjectId,
  email: string
): Promise<string> => {
  // Generar token seguro usando crypto
  const token = crypto.randomBytes(32).toString('hex');

  // Fecha de expiración: 1 hora desde ahora
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  // Eliminar tokens antiguos del mismo usuario
  await ResetToken.deleteMany({ userId });

  // Guardar token en MongoDB
  await ResetToken.create({
    userId,
    email: email.toLowerCase(),
    token,
    expiresAt
  });

  return token;
};

/**
 * Verifica y obtiene el email asociado a un token de reset
 * @param token - Token a verificar
 * @returns Email del usuario o null si el token es inválido/expirado
 */
export const verifyResetToken = async (token: string): Promise<string | null> => {
  // Buscar token en la base de datos
  const resetTokenDoc = await ResetToken.findOne({ token });

  // Si no existe el token
  if (!resetTokenDoc) {
    return null;
  }

  // Verificar si el token expiró
  if (new Date() > resetTokenDoc.expiresAt) {
    // Eliminar token expirado
    await ResetToken.deleteOne({ token });
    return null;
  }

  // Token válido, retornar email
  return resetTokenDoc.email;
};

/**
 * Elimina un token de reset después de usarlo
 * @param token - Token a eliminar
 */
export const deleteResetToken = async (token: string): Promise<void> => {
  await ResetToken.deleteOne({ token });
};

/**
 * Obtiene información del token (para debugging)
 * @param token - Token a verificar
 * @returns Información del token o null
 */
export const getTokenInfo = async (token: string) => {
  const resetTokenDoc = await ResetToken.findOne({ token });
  return resetTokenDoc ? {
    email: resetTokenDoc.email,
    userId: resetTokenDoc.userId,
    expiresAt: resetTokenDoc.expiresAt,
    isValid: new Date() < resetTokenDoc.expiresAt
  } : null;
};

