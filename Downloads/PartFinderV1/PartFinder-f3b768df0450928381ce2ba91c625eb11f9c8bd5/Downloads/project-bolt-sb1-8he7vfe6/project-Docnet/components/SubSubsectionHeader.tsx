// components/SubSubsectionHeader.tsx
'use client';
import React from 'react';
import { SubSubCategory } from '@/lib/types/parts';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';

interface SubSubsectionHeaderProps {
  categoryName: string;
  subcategoryName: string;
  subsubcategory: SubSubCategory;
  onBackToSubcategory?: () => void;
}

export default function SubSubsectionHeader({ 
  categoryName, 
  subcategoryName,
  subsubcategory, 
  onBackToSubcategory 
}: SubSubsectionHeaderProps) {
  return (
    <div className="bg-gray-800 bg-opacity-70 rounded-lg p-4 border-l-4 border-red-600">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
        <button
          onClick={() => {}}
          className="flex items-center space-x-1 hover:text-red-400 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Inicio</span>
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-300">{categoryName}</span>
        <ChevronRight className="w-4 h-4" />
        <button
          onClick={onBackToSubcategory}
          className="text-gray-300 hover:text-red-400 transition-colors"
        >
          {subcategoryName}
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-red-400 font-medium">{subsubcategory.name}</span>
      </nav>

      {/* SubSubsection Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-red-600 mb-2">
            {subsubcategory.name}
          </h3>
          <p className="text-sm text-gray-300 mb-2">
            {subsubcategory.description}
          </p>
          <div className="text-xs text-gray-400">
            {subsubcategory.parts.length} producto{subsubcategory.parts.length !== 1 ? 's' : ''} disponible{subsubcategory.parts.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 md:mt-0 md:ml-6">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-gray-700 rounded-lg p-2">
              <div className="text-sm font-bold text-red-400">
                {subsubcategory.parts.filter(p => p.inStock).length}
              </div>
              <div className="text-xs text-gray-400">En Stock</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-2">
              <div className="text-sm font-bold text-yellow-400">
                {subsubcategory.parts.filter(p => p.rating && p.rating >= 4.5).length}
              </div>
              <div className="text-xs text-gray-400">Top Rated</div>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <button
          onClick={onBackToSubcategory}
          className="flex items-center space-x-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a {subcategoryName}</span>
        </button>
      </div>
    </div>
  );
}
