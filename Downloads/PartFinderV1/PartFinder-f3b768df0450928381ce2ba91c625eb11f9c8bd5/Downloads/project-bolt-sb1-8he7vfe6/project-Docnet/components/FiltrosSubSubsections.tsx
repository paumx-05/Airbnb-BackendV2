// components/FiltrosSubSubsections.tsx
'use client';
import React, { useState } from 'react';
import { SubSubCategory, ViewMode } from '@/lib/types/parts';
import SubSubCategoriesNavigation from './SubSubCategoriesNavigation';
import SubSubsectionHeader from './SubSubsectionHeader';
import PartsToolbar from './PartsToolbar';
import PartsGrid from './PartsGrid';
import PartsList from './PartsList';
// import FiltrosFilters from './FiltrosFilters';
import { filtersSubSubsections } from '@/lib/mocks/filtersSubSubsections';

interface FiltrosSubSubsectionsProps {
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

export default function FiltrosSubSubsections({ 
  vehicleData, 
  onAddToCart, 
  cartItemsCount = 0,
  onBackToSubcategory
}: FiltrosSubSubsectionsProps) {
  const [activeSubSubcategory, setActiveSubSubcategory] = useState('oil-filter');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [compatibilityFilter, setCompatibilityFilter] = useState('');

  const currentSubSubcategory = filtersSubSubsections.find(subsub => subsub.id === activeSubSubcategory);

  const filteredParts = currentSubSubcategory?.parts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBrand = !brandFilter ||
      part.brand.toLowerCase().includes(brandFilter.toLowerCase());

    const matchesCompatibility = !compatibilityFilter ||
      part.compatibility.some(comp => 
        comp.toLowerCase().includes(compatibilityFilter.toLowerCase())
      );

    return matchesSearch && matchesBrand && matchesCompatibility;
  }) || [];

  const handleClearFilters = () => {
    setBrandFilter('');
    setCompatibilityFilter('');
  };

  if (!currentSubSubcategory) {
    return (
      <div className="bg-gray-800 bg-opacity-70 rounded-lg p-6 text-center">
        <p className="text-gray-400">No se encontró la subcategoría seleccionada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con breadcrumbs */}
      <SubSubsectionHeader
        categoryName="Mantenimientos básicos"
        subcategoryName="Filtros"
        subsubcategory={currentSubSubcategory}
        onBackToSubcategory={onBackToSubcategory}
      />

      {/* Navegación de subsubcategorías */}
      <SubSubCategoriesNavigation
        subsubcategories={filtersSubSubsections}
        activeSubSubcategory={activeSubSubcategory}
        onSubSubcategoryChange={setActiveSubSubcategory}
      />

      {/* Filtros específicos para filtros - Temporalmente comentado */}
      {/* <FiltrosFilters
        onBrandFilter={setBrandFilter}
        onCompatibilityFilter={setCompatibilityFilter}
        onClearFilters={handleClearFilters}
        activeBrand={brandFilter}
        activeCompatibility={compatibilityFilter}
      /> */}

      {/* Toolbar con búsqueda, vista y carrito */}
      <PartsToolbar
        category={{
          id: 'filters',
          name: 'Filtros',
          icon: 'Filter',
          description: 'Filtros de aceite, aire, combustible, habitáculo',
          parts: []
        }}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        vehicleData={vehicleData}
        partsCount={filteredParts.length}
        cartItemsCount={cartItemsCount}
      />

      {/* Contenido de productos */}
      <div className="bg-gray-800 bg-opacity-70 rounded-lg p-6">
        {filteredParts.length > 0 ? (
          viewMode === 'grid' ? (
            <PartsGrid parts={filteredParts} onAddToCart={onAddToCart} />
          ) : (
            <PartsList parts={filteredParts} onAddToCart={onAddToCart} />
          )
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-2">No se encontraron productos</p>
            <p className="text-gray-500 text-sm">
              {searchQuery || brandFilter || compatibilityFilter
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay productos disponibles en esta categoría'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
