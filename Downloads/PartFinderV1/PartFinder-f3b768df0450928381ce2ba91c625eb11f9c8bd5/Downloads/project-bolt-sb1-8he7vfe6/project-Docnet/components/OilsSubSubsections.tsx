// components/OilsSubSubsections.tsx
'use client';
import React, { useState } from 'react';
import { SubSubCategory, ViewMode } from '@/lib/types/parts';
import SubSubCategoriesNavigation from './SubSubCategoriesNavigation';
import SubSubsectionHeader from './SubSubsectionHeader';
import PartsToolbar from './PartsToolbar';
import PartsGrid from './PartsGrid';
import PartsList from './PartsList';
import OilsFilters from './OilsFilters';
import { oilsSubSubsections } from '@/lib/mocks/oilsSubSubsections';

interface OilsSubSubsectionsProps {
  vehicleData: {
    vin: string;
    brand: string;
    model: string;
    year: string;
  };
  onAddToCart?: (part: any) => void;
  cartItemsCount?: number;
  onBackToSubcategory?: () => void;
}

export default function OilsSubSubsections({ 
  vehicleData, 
  onAddToCart, 
  cartItemsCount = 0,
  onBackToSubcategory
}: OilsSubSubsectionsProps) {
  const [activeSubSubcategory, setActiveSubSubcategory] = useState('engine-oil');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [viscosityFilter, setViscosityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const currentSubSubcategory = oilsSubSubsections.find(sub => sub.id === activeSubSubcategory);

  const filteredParts = currentSubSubcategory?.parts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesViscosity = !viscosityFilter || 
      part.name.toLowerCase().includes(viscosityFilter.toLowerCase()) ||
      part.description.toLowerCase().includes(viscosityFilter.toLowerCase());
    
    const matchesType = !typeFilter || 
      part.description.toLowerCase().includes(typeFilter.toLowerCase());
    
    return matchesSearch && matchesViscosity && matchesType;
  }) || [];

  const handleClearFilters = () => {
    setViscosityFilter('');
    setTypeFilter('');
  };

  if (!currentSubSubcategory) {
    return (
      <div className="bg-gray-800 bg-opacity-70 rounded-lg p-8 text-center">
        <p className="text-gray-400">No se encontró la subsección seleccionada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SubSubsection Header with Breadcrumbs */}
      <SubSubsectionHeader
        categoryName="Mantenimientos básicos"
        subcategoryName="Aceites"
        subsubcategory={currentSubSubcategory}
        onBackToSubcategory={onBackToSubcategory}
      />

      {/* SubSubcategories Navigation */}
      <SubSubCategoriesNavigation
        subsubcategories={oilsSubSubsections}
        activeSubSubcategory={activeSubSubcategory}
        onSubSubcategoryChange={setActiveSubSubcategory}
      />

      {/* Oils Specific Filters */}
      <OilsFilters
        onViscosityFilter={setViscosityFilter}
        onTypeFilter={setTypeFilter}
        onClearFilters={handleClearFilters}
        activeViscosity={viscosityFilter}
        activeType={typeFilter}
      />

      {/* Toolbar */}
      <PartsToolbar
        category={{
          id: 'oils',
          name: currentSubSubcategory.name,
          icon: 'Droplets',
          description: currentSubSubcategory.description,
          parts: currentSubSubcategory.parts
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        vehicleData={vehicleData}
        partsCount={filteredParts.length}
        cartItemsCount={cartItemsCount}
      />

      {/* Products Display */}
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
