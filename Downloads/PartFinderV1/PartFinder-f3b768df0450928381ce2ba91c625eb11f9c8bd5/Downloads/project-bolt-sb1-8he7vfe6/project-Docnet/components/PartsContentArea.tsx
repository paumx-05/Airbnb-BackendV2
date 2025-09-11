// components/PartsContentArea.tsx
'use client';
import React from 'react';
import { Category, ViewMode, Part } from '@/lib/types/parts';
import PartsToolbar from './PartsToolbar';
import PartsGrid from './PartsGrid';
import PartsList from './PartsList';
import CategoriesSidebar from './CategoriesSidebar';
import MaintenanceSubsections from './MaintenanceSubsections';

interface PartsContentAreaProps {
  category: Category | undefined;
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
  onAddToCart?: (part: Part) => void;
  cartItemsCount?: number;
  categories?: Category[];
  activeCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
}

export default function PartsContentArea({ 
  category, 
  viewMode, 
  onViewModeChange, 
  searchQuery, 
  onSearchQueryChange,
  vehicleData,
  onAddToCart,
  cartItemsCount = 0,
  categories,
  activeCategory,
  onCategoryChange
}: PartsContentAreaProps) {
  if (!category) {
    return (
      <div className="bg-gray-800 bg-opacity-70 rounded-lg p-8 text-center">
        <p className="text-gray-400">Selecciona una categoría para ver los recambios disponibles</p>
      </div>
    );
  }

  // Special handling for maintenance category with subsections
  if (category.id === 'maintenance') {
    return (
      <MaintenanceSubsections
        vehicleData={vehicleData}
        onAddToCart={onAddToCart}
        cartItemsCount={cartItemsCount}
      />
    );
  }

  const filteredParts = category.parts.filter(part =>
    part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    part.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    part.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Mobile Categories Selector */}
      {categories && activeCategory && onCategoryChange && (
        <div className="lg:hidden">
          <CategoriesSidebar
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
          />
        </div>
      )}

      <PartsToolbar
        category={category}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        searchQuery={searchQuery}
        onSearchQueryChange={onSearchQueryChange}
        vehicleData={vehicleData}
        partsCount={filteredParts.length}
        cartItemsCount={cartItemsCount}
      />
      
      <div className="bg-gray-800 bg-opacity-70 rounded-lg p-6">
        {viewMode === 'grid' ? (
          <PartsGrid parts={filteredParts} onAddToCart={onAddToCart} />
        ) : (
          <PartsList parts={filteredParts} onAddToCart={onAddToCart} />
        )}
      </div>
    </div>
  );
}
