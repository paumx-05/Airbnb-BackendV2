// components/SubsectionHeader.tsx
'use client';
import React from 'react';
import { SubCategory } from '@/lib/types/parts';
import { ChevronRight, Home } from 'lucide-react';

interface SubsectionHeaderProps {
  categoryName: string;
  subcategory: SubCategory;
  onBackToCategory?: () => void;
}

export function SubsectionHeader({ 
  categoryName, 
  subcategory, 
  onBackToCategory 
}: SubsectionHeaderProps) {
  return (
    <div className="bg-gray-800 bg-opacity-70 rounded-lg p-4 border-l-4 border-red-600">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
        <button
          onClick={onBackToCategory}
          className="flex items-center space-x-1 hover:text-red-400 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Inicio</span>
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-300">{categoryName}</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-red-400 font-medium">{subcategory.name}</span>
      </nav>

      {/* Subsection Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            {subcategory.name}
          </h2>
          <p className="text-sm text-gray-300 mb-2">
            {subcategory.description}
          </p>
          <div className="text-xs text-gray-400">
            {subcategory.parts.length} producto{subcategory.parts.length !== 1 ? 's' : ''} disponible{subcategory.parts.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 md:mt-0 md:ml-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-lg font-bold text-red-400">
                {subcategory.parts.filter(p => p.inStock).length}
              </div>
              <div className="text-xs text-gray-400">En Stock</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-lg font-bold text-yellow-400">
                {subcategory.parts.filter(p => p.rating && p.rating >= 4.5).length}
              </div>
              <div className="text-xs text-gray-400">Top Rated</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
