import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { getLocationSuggestions } from '@/lib/mockData';

// Interfaz para las sugerencias de ubicación
interface LocationSuggestion {
  name: string;
  country: string;
  type: 'city' | 'country' | 'region';
}

/**
 * Hook personalizado para búsqueda de ubicaciones con sugerencias en tiempo real
 * Implementa debounce para evitar demasiadas búsquedas mientras el usuario escribe
 * 
 * @param searchTerm - El término de búsqueda del usuario
 * @returns Objeto con sugerencias, estado de carga y función para limpiar sugerencias
 */
export function useLocationSearch(searchTerm: string) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Usar debounce para evitar búsquedas excesivas
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    // Si no hay término de búsqueda, limpiar sugerencias
    if (!debouncedSearchTerm.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    // Simular búsqueda con delay
    setIsLoading(true);
    
    const searchTimeout = setTimeout(() => {
      // Usar la función de mockData para obtener sugerencias
      const filteredSuggestions = getLocationSuggestions(debouncedSearchTerm);

      setSuggestions(filteredSuggestions);
      setIsLoading(false);
    }, 200); // Pequeño delay para simular API call

    return () => {
      clearTimeout(searchTimeout);
    };
  }, [debouncedSearchTerm]);

  // Función para limpiar sugerencias
  const clearSuggestions = () => {
    setSuggestions([]);
    setIsLoading(false);
  };

  return {
    suggestions,
    isLoading,
    clearSuggestions
  };
}

export default useLocationSearch;
