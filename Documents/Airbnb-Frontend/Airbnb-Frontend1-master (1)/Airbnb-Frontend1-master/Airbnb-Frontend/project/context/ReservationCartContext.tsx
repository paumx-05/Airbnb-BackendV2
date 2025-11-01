'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ReservationData } from '@/lib/api/reservations';

// Interfaz para items del carrito - reutiliza ReservationData existente
export interface CartItem extends ReservationData {
  id: string; // ID único para el carrito
  propertyTitle: string;
  propertyLocation: string;
  propertyImage: string;
}

// Interfaz del contexto del carrito
interface ReservationCartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (propertyId: string, checkIn: string, checkOut: string) => boolean;
}

// Crear el contexto
const ReservationCartContext = createContext<ReservationCartContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useReservationCart = () => {
  const context = useContext(ReservationCartContext);
  if (!context) {
    throw new Error('useReservationCart debe usarse dentro de ReservationCartProvider');
  }
  return context;
};

// Props del provider
interface ReservationCartProviderProps {
  children: ReactNode;
}

// Provider del contexto
export const ReservationCartProvider = ({ children }: ReservationCartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Cargar datos del localStorage al inicializar
  useEffect(() => {
    const savedCart = localStorage.getItem('reservation-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error cargando carrito desde localStorage:', error);
        setItems([]);
      }
    }
  }, []);

  // Guardar en localStorage cuando cambie el carrito
  useEffect(() => {
    localStorage.setItem('reservation-cart', JSON.stringify(items));
  }, [items]);

  // Función para generar ID único
  const generateId = (): string => {
    return `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Agregar item al carrito
  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...item,
      id: generateId(),
    };
    
    setItems(prevItems => {
      // Verificar si ya existe una reserva similar
      const existingIndex = prevItems.findIndex(
        existing => 
          existing.propertyId === item.propertyId &&
          existing.checkIn === item.checkIn &&
          existing.checkOut === item.checkOut
      );
      
      if (existingIndex >= 0) {
        // Si existe, actualizar el item existente
        const updatedItems = [...prevItems];
        updatedItems[existingIndex] = newItem;
        return updatedItems;
      } else {
        // Si no existe, agregar nuevo item
        return [...prevItems, newItem];
      }
    });
  };

  // Eliminar item del carrito
  const removeFromCart = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Limpiar todo el carrito
  const clearCart = () => {
    setItems([]);
  };

  // Obtener número total de items
  const getTotalItems = (): number => {
    return items.length;
  };

  // Obtener precio total del carrito
  const getTotalPrice = (): number => {
    return items.reduce((total, item) => total + item.total, 0);
  };

  // Verificar si una reserva ya está en el carrito
  const isInCart = (propertyId: string, checkIn: string, checkOut: string): boolean => {
    return items.some(
      item => 
        item.propertyId === propertyId &&
        item.checkIn === checkIn &&
        item.checkOut === checkOut
    );
  };

  // Valor del contexto
  const value: ReservationCartContextType = {
    items,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart,
  };

  return (
    <ReservationCartContext.Provider value={value}>
      {children}
    </ReservationCartContext.Provider>
  );
};
