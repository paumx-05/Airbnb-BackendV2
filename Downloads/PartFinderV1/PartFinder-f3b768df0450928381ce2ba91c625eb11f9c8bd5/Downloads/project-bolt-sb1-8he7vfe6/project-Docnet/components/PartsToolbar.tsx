// components/PartsToolbar.tsx
'use client';
import React from 'react';
import { Category, ViewMode } from '@/lib/types/parts';
import { Search, Grid3X3, List, ShoppingCart } from 'lucide-react';

interface PartsToolbarProps {
  category: Category;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  vehicleData: {
    vin: string;
    brand: string;
    model: string;
    year: string;
  };
  partsCount: number;
  cartItemsCount?: number;
}

export default function PartsToolbar({
  category,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchQueryChange,
  vehicleData,
  partsCount,
  cartItemsCount = 0
}: PartsToolbarProps) {
  return (
    <div className="bg-gray-800 bg-opacity-70 rounded-lg p-4 border-l-4 border-red-600">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Title and Vehicle Info */}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-red-600 mb-2">{category.name}</h2>
          <p className="text-sm text-gray-300 mb-2">{category.description}</p>
          <div className="text-xs text-gray-400">
            Compatible con: {vehicleData.brand} {vehicleData.model} ({vehicleData.year})
          </div>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar recambios..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
              }`}
              title="Vista de cuadrícula"
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
              }`}
              title="Vista de lista"
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Button */}
          <button className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors relative">
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Carrito ({cartItemsCount})</span>
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <p className="text-sm text-gray-400">
          {partsCount} recambio{partsCount !== 1 ? 's' : ''} encontrado{partsCount !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
