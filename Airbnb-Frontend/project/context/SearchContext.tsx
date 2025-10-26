'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { filterProperties, mockProperties, type AirbnbProperty } from '@/lib/mockData';

// Interfaz para los datos de búsqueda
interface SearchData {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

// Interfaz para los filtros
interface SearchFilters {
  propertyType: 'entire' | 'private' | 'shared' | '';
  minPrice: number;
  maxPrice: number;
  amenities: string[];
  minRating: number;
  instantBook: boolean;
}

// Interfaz para el contexto
interface SearchContextType {
  // Datos de búsqueda
  searchData: SearchData;
  setSearchData: (data: SearchData) => void;
  
  // Filtros
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  
  // Propiedades filtradas
  filteredProperties: AirbnbProperty[];
  
  // Estados de UI
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
  
  // Funciones
  performSearch: () => void;
  clearFilters: () => void;
}

// Crear el contexto
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch debe ser usado dentro de SearchProvider');
  }
  return context;
};

// Provider del contexto
export const SearchProvider = ({ children }: { children: ReactNode }) => {
  // Estados para datos de búsqueda
  const [searchData, setSearchData] = useState<SearchData>({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  });

  // Estados para filtros
  const [filters, setFilters] = useState<SearchFilters>({
    propertyType: '',
    minPrice: 0,
    maxPrice: 1000,
    amenities: [],
    minRating: 0,
    instantBook: false
  });

  // Estado de búsqueda
  const [isSearching, setIsSearching] = useState(false);

  // Filtrar propiedades basado en los criterios actuales
  const filteredProperties = filterProperties(mockProperties, {
    location: searchData.location,
    checkIn: searchData.checkIn,
    checkOut: searchData.checkOut,
    guests: searchData.guests,
    ...filters
  });

  // Función para realizar búsqueda
  const performSearch = () => {
    setIsSearching(true);
    
    // Simular búsqueda con delay
    setTimeout(() => {
      setIsSearching(false);
      console.log('Búsqueda realizada:', { searchData, filters });
    }, 1000);
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setFilters({
      propertyType: '',
      minPrice: 0,
      maxPrice: 1000,
      amenities: [],
      minRating: 0,
      instantBook: false
    });
  };

  const value: SearchContextType = {
    searchData,
    setSearchData,
    filters,
    setFilters,
    filteredProperties,
    isSearching,
    setIsSearching,
    performSearch,
    clearFilters
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
