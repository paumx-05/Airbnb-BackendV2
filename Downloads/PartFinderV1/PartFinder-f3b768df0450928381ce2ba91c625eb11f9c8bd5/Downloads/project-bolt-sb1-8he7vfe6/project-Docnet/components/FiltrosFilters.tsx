// components/FiltrosFilters.tsx
'use client';
import React from 'react';
import { Filter, X } from 'lucide-react';

interface FiltrosFiltersProps {
  onBrandFilter: (brand: string) => void;
  onCompatibilityFilter: (compatibility: string) => void;
  onClearFilters: () => void;
  activeBrand: string;
  activeCompatibility: string;
}

const brandOptions = [
  { value: '', label: 'Todas las marcas' },
  { value: 'Bosch', label: 'Bosch' },
  { value: 'Mann-Filter', label: 'Mann-Filter' },
  { value: 'Mahle', label: 'Mahle' },
  { value: 'Fram', label: 'Fram' },
  { value: 'K&N', label: 'K&N' },
];

const compatibilityOptions = [
  { value: '', label: 'Todos los vehículos' },
  { value: 'Fiat Grande Punto', label: 'Fiat Grande Punto' },
  { value: 'Fiat Punto Evo', label: 'Fiat Punto Evo' },
  { value: 'Fiat 500', label: 'Fiat 500' },
  { value: 'Fiat Panda', label: 'Fiat Panda' },
];

export default function FiltrosFilters({
  onBrandFilter,
  onCompatibilityFilter,
  onClearFilters,
  activeBrand,
  activeCompatibility
}: FiltrosFiltersProps) {
  const hasActiveFilters = activeBrand || activeCompatibility;

  return (
    <div className="bg-gray-800 bg-opacity-70 rounded-lg p-4 border-l-4 border-red-600">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-red-600" />
          <h4 className="text-lg font-bold text-red-600">Filtros de Búsqueda</h4>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Filtro por Marca */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Marca
          </label>
          <select
            value={activeBrand}
            onChange={(e) => onBrandFilter(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
          >
            {brandOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Compatibilidad */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Compatibilidad
          </label>
          <select
            value={activeCompatibility}
            onChange={(e) => onCompatibilityFilter(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
          >
            {compatibilityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Indicadores de filtros activos */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {activeBrand && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
              Marca: {brandOptions.find(opt => opt.value === activeBrand)?.label}
              <button
                onClick={() => onBrandFilter('')}
                className="ml-2 hover:text-gray-300"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {activeCompatibility && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
              Vehículo: {compatibilityOptions.find(opt => opt.value === activeCompatibility)?.label}
              <button
                onClick={() => onCompatibilityFilter('')}
                className="ml-2 hover:text-gray-300"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
