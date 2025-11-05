import bcrypt from 'bcrypt';

export interface User {
  id: string;
  email: string;
  password: string; // hasheada
  nombre: string;
  descripcion?: string;
  avatar?: string;
  fechaCreacion: Date;
}

// Almacén de datos mock (en memoria)
let users: User[] = [];

// Inicializar con un usuario de prueba
const initializeMockData = async (): Promise<void> => {
  if (users.length === 0) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    users.push({
      id: '1',
      email: 'demo@example.com',
      password: hashedPassword,
      nombre: 'Usuario Demo',
      descripcion: 'Usuario de demostración',
      fechaCreacion: new Date()
    });
  }
};

// Funciones para manejar usuarios
export const getUserByEmail = async (email: string): Promise<User | null> => {
  await initializeMockData();
  return users.find(u => u.email === email) || null;
};

export const getUserById = async (id: string): Promise<User | null> => {
  await initializeMockData();
  return users.find(u => u.id === id) || null;
};

export const createUser = async (userData: Omit<User, 'id' | 'fechaCreacion'>): Promise<User> => {
  await initializeMockData();
  
  // Verificar si el email ya existe
  const existingUser = await getUserByEmail(userData.email);
  if (existingUser) {
    throw new Error('El email ya está registrado');
  }
  
  const newUser: User = {
    ...userData,
    id: (users.length + 1).toString(),
    fechaCreacion: new Date()
  };
  
  users.push(newUser);
  return newUser;
};

export const updateUser = async (id: string, updates: Partial<Omit<User, 'id' | 'email' | 'password' | 'fechaCreacion'>>): Promise<User | null> => {
  await initializeMockData();
  
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return null;
  }
  
  users[userIndex] = {
    ...users[userIndex],
    ...updates
  };
  
  return users[userIndex];
};

export const updateUserPassword = async (id: string, newPassword: string): Promise<User | null> => {
  await initializeMockData();
  
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return null;
  }
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  users[userIndex].password = hashedPassword;
  
  return users[userIndex];
};

// Almacén de tokens de reset (en memoria)
interface ResetToken {
  email: string;
  token: string;
  expiresAt: Date;
}

let resetTokens: ResetToken[] = [];

export const createResetToken = (email: string): string => {
  // Generar token único (en producción usar crypto)
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Expira en 1 hora
  
  // Eliminar tokens antiguos del mismo email
  resetTokens = resetTokens.filter(t => t.email !== email);
  
  resetTokens.push({ email, token, expiresAt });
  return token;
};

export const verifyResetToken = (token: string): string | null => {
  const resetToken = resetTokens.find(t => t.token === token);
  
  if (!resetToken) {
    return null;
  }
  
  // Verificar si el token expiró
  if (new Date() > resetToken.expiresAt) {
    resetTokens = resetTokens.filter(t => t.token !== token);
    return null;
  }
  
  return resetToken.email;
};

export const deleteResetToken = (token: string): void => {
  resetTokens = resetTokens.filter(t => t.token !== token);
};

// Inicializar datos al importar
initializeMockData();

