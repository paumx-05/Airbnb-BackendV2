// components/OilsFilters.tsx
'use client';
import React from 'react';
import { Filter, X } from 'lucide-react';

interface OilsFiltersProps {
  onViscosityFilter: (viscosity: string) => void;
  onTypeFilter: (type: string) => void;
  onClearFilters: () => void;
  activeViscosity: string;
  activeType: string;
}

const viscosityOptions = [
  { value: '', label: 'Todas las viscosidades' },
  { value: '5W-30', label: '5W-30' },
  { value: '10W-40', label: '10W-40' },
  { value: '15W-40', label: '15W-40' },
  { value: '0W-20', label: '0W-20' },
  { value: '75W-90', label: '75W-90' },
  { value: '80W-90', label: '80W-90' },
  { value: '85W-140', label: '85W-140' },
  { value: '75W-80', label: '75W-80' },
  { value: 'ATF', label: 'ATF' },
];

const typeOptions = [
  { value: '', label: 'Todos los tipos' },
  { value: 'sintético', label: 'Sintético' },
  { value: 'mineral', label: 'Mineral' },
  { value: 'semi-sintético', label: 'Semi-Sintético' },
  { value: 'hidráulico', label: 'Hidráulico' },
];

export default function OilsFilters({
  onViscosityFilter,
  onTypeFilter,
  onClearFilters,
  activeViscosity,
  activeType
}: OilsFiltersProps) {
  const hasActiveFilters = activeViscosity || activeType;

  return (
    <div className="bg-gray-800 bg-opacity-70 rounded-lg p-4 border-l-4 border-red-600">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-red-600 flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <span>Filtros Específicos</span>
        </h4>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-xs text-gray-400 hover:text-red-400 transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Viscosity Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">
            Viscosidad
          </label>
          <select
            value={activeViscosity}
            onChange={(e) => onViscosityFilter(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
          >
            {viscosityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">
            Tipo de Aceite
          </label>
          <select
            value={activeType}
            onChange={(e) => onTypeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <div className="flex flex-wrap gap-2">
            {activeViscosity && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-600 text-white">
                Viscosidad: {activeViscosity}
                <button
                  onClick={() => onViscosityFilter('')}
                  className="ml-1 hover:text-gray-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeType && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-600 text-white">
                Tipo: {activeType}
                <button
                  onClick={() => onTypeFilter('')}
                  className="ml-1 hover:text-gray-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
