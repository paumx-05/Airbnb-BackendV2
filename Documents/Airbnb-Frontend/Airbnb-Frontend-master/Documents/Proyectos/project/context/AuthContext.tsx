'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthResponse, authMock, tokenStorage } from '@/lib/auth-mock';

// Types
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Actions
type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      const token = tokenStorage.get();
      if (token) {
        dispatch({ type: 'AUTH_START' });
        try {
          const response = await authMock.verifyToken(token);
          if (response.success && response.user) {
            dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
          } else {
            tokenStorage.remove();
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } catch (error) {
          tokenStorage.remove();
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response: AuthResponse = await authMock.login(email, password);
      
      if (response.success && response.user && response.token) {
        tokenStorage.set(response.token);
        dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: response.message || 'Error en el login' });
      }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: 'Error de conexión' });
    }
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response: AuthResponse = await authMock.register(email, password, name);
      
      if (response.success && response.user && response.token) {
        tokenStorage.set(response.token);
        dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: response.message || 'Error en el registro' });
      }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: 'Error de conexión' });
    }
  };

  const logout = async (): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    try {
      await authMock.logout();
      tokenStorage.remove();
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      // Incluso si falla el logout en el servidor, limpiamos localmente
      tokenStorage.remove();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


