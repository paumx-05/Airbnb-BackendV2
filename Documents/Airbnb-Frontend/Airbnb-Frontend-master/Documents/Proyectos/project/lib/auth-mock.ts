// Mock Users Database
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

// Mock database - En producción esto estaría en una base de datos real
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'demo@airbnb.com',
    name: 'Demo User',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'john@example.com',
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    createdAt: '2024-01-15T00:00:00Z'
  }
];

// Simulación de delay de red
const networkDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Mock Authentication Functions
export const authMock = {
  // Login function
  async login(email: string, password: string): Promise<AuthResponse> {
    await networkDelay(1500); // Simular delay de red
    
    // Validaciones básicas
    if (!email || !password) {
      return {
        success: false,
        message: 'Email y contraseña son requeridos'
      };
    }
    
    if (!email.includes('@')) {
      return {
        success: false,
        message: 'Email inválido'
      };
    }
    
    if (password.length < 6) {
      return {
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      };
    }
    
    // Buscar usuario en mock database
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return {
        success: false,
        message: 'Usuario no encontrado'
      };
    }
    
    // En un sistema real, aquí verificarías la contraseña hasheada
    // Para el mock, aceptamos cualquier contraseña válida
    const mockToken = btoa(`${user.id}-${Date.now()}`);
    
    return {
      success: true,
      user,
      token: mockToken,
      message: 'Login exitoso'
    };
  },

  // Register function
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    await networkDelay(2000); // Simular delay de red
    
    // Validaciones
    if (!email || !password || !name) {
      return {
        success: false,
        message: 'Todos los campos son requeridos'
      };
    }
    
    if (!email.includes('@')) {
      return {
        success: false,
        message: 'Email inválido'
      };
    }
    
    if (password.length < 6) {
      return {
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      };
    }
    
    if (name.length < 2) {
      return {
        success: false,
        message: 'El nombre debe tener al menos 2 caracteres'
      };
    }
    
    // Verificar si el usuario ya existe
    const existingUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      return {
        success: false,
        message: 'Este email ya está registrado'
      };
    }
    
    // Crear nuevo usuario
    const newUser: User = {
      id: (MOCK_USERS.length + 1).toString(),
      email: email.toLowerCase(),
      name: name.trim(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FF385C&color=fff&size=100`,
      createdAt: new Date().toISOString()
    };
    
    // "Guardar" en mock database
    MOCK_USERS.push(newUser);
    
    const mockToken = btoa(`${newUser.id}-${Date.now()}`);
    
    return {
      success: true,
      user: newUser,
      token: mockToken,
      message: 'Registro exitoso'
    };
  },

  // Logout function
  async logout(): Promise<AuthResponse> {
    await networkDelay(500);
    
    return {
      success: true,
      message: 'Sesión cerrada exitosamente'
    };
  },

  // Verify token function
  async verifyToken(token: string): Promise<AuthResponse> {
    await networkDelay(800);
    
    if (!token) {
      return {
        success: false,
        message: 'Token no proporcionado'
      };
    }
    
    try {
      // Decodificar token mock
      const decoded = atob(token);
      const [userId] = decoded.split('-');
      
      const user = MOCK_USERS.find(u => u.id === userId);
      
      if (!user) {
        return {
          success: false,
          message: 'Token inválido'
        };
      }
      
      return {
        success: true,
        user,
        token,
        message: 'Token válido'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Token malformado'
      };
    }
  },

  // Forgot password function
  async forgotPassword(email: string): Promise<AuthResponse> {
    await networkDelay(2000); // Simular delay de red
    
    // Validaciones básicas
    if (!email) {
      return {
        success: false,
        message: 'Email es requerido'
      };
    }
    
    if (!email.includes('@')) {
      return {
        success: false,
        message: 'Email inválido'
      };
    }
    
    // Buscar usuario en mock database
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return {
        success: true,
        message: 'Si el email existe, recibirás un enlace de recuperación'
      };
    }
    
    // Simular envío de email exitoso
    return {
      success: true,
      message: 'Email de recuperación enviado exitosamente'
    };
  }
};

// Utilidades para localStorage y cookies (mock de persistencia)
export const tokenStorage = {
  set: (token: string) => {
    if (typeof window !== 'undefined') {
      // Guardar en localStorage
      localStorage.setItem('airbnb_auth_token', token);
      
      // Guardar en cookies para el middleware
      document.cookie = `airbnb_auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
    }
  },
  
  get: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('airbnb_auth_token');
    }
    return null;
  },
  
  remove: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('airbnb_auth_token');
      
      // Eliminar cookie
      document.cookie = 'airbnb_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }
};
