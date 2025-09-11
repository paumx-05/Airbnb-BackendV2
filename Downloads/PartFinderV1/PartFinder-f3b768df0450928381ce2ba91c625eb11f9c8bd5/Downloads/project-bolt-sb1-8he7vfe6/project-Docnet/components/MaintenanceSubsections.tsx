// components/MaintenanceSubsections.tsx
'use client';
import React, { useState } from 'react';
import { SubCategory, ViewMode, Part } from '@/lib/types/parts';
import { SubCategoriesNavigation } from './SubCategoriesNavigation';
import { SubsectionHeader } from './SubsectionHeader';
import PartsToolbar from './PartsToolbar';
import PartsGrid from './PartsGrid';
import PartsList from './PartsList';
import OilsSubSubsections from './OilsSubSubsections';
import FiltrosSubSubsections from './FiltrosSubSubsections';
import { maintenanceSubsections } from '@/lib/mocks/maintenanceSubsections';
import { oilsSubSubsections } from '@/lib/mocks/oilsSubSubsections';
import { filtersSubSubsections } from '@/lib/mocks/filtersSubSubsections';

interface MaintenanceSubsectionsProps {
  vehicleData: {
    vin: string;
    brand: string;
    model: string;
    year: string;
  };
  onAddToCart?: (part: any) => void;
  cartItemsCount?: number;
}

export default function MaintenanceSubsections({ 
  vehicleData, 
  onAddToCart, 
  cartItemsCount = 0 
}: MaintenanceSubsectionsProps) {
  const [activeSubcategory, setActiveSubcategory] = useState('oils');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubSubsections, setShowSubSubsections] = useState(false);
  const [activeOilType, setActiveOilType] = useState('engine-oil');
  const [activeFilterType, setActiveFilterType] = useState('oil-filter');

  const currentSubcategory = maintenanceSubsections.find(sub => sub.id === activeSubcategory);

  // Filter parts based on search query and type if in oils or filters subcategory
  let filteredParts: Part[] = [];
  
  if (activeSubcategory === 'oils' && !showSubSubsections) {
    // For oils subcategory, get products from the selected oil type
    const oilType = oilsSubSubsections.find(type => type.id === activeOilType);
    if (oilType) {
      filteredParts = oilType.parts.filter(part => {
        return part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          part.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          part.description.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
  } else if (activeSubcategory === 'filters' && !showSubSubsections) {
    // For filters subcategory, get products from the selected filter type
    const filterType = filtersSubSubsections.find(type => type.id === activeFilterType);
    if (filterType) {
      filteredParts = filterType.parts.filter(part => {
        return part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          part.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          part.description.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
  } else {
    // For other subcategories, use the normal filtering
    filteredParts = currentSubcategory?.parts.filter(part => {
      return part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.description.toLowerCase().includes(searchQuery.toLowerCase());
    }) || [];
  }

  const handleBackToCategory = () => {
    // This would navigate back to the main category view
    // For now, we'll just reset the subcategory
    setActiveSubcategory('oils');
  };

  const handleBackToSubcategory = () => {
    // Reset to show the main subcategories view
    setShowSubSubsections(false);
  };

  const handleEnterSubSubsections = () => {
    // Show subsubsections for the current subcategory
    setShowSubSubsections(true);
  };

  if (!currentSubcategory) {
    return (
      <div className="bg-gray-800 bg-opacity-70 rounded-lg p-8 text-center">
        <p className="text-gray-400">No se encontró la subsección seleccionada</p>
      </div>
    );
  }

  // Special handling for oils subcategory with subsubsections
  if (activeSubcategory === 'oils' && showSubSubsections) {
    return (
      <OilsSubSubsections
        vehicleData={vehicleData}
        onAddToCart={onAddToCart}
        cartItemsCount={cartItemsCount}
        onBackToSubcategory={handleBackToSubcategory}
      />
    );
  }

  // Special handling for filters subcategory with subsubsections
  if (activeSubcategory === 'filters' && showSubSubsections) {
    return (
      <FiltrosSubSubsections
        vehicleData={vehicleData}
        onAddToCart={onAddToCart}
        cartItemsCount={cartItemsCount}
        onBackToSubcategory={handleBackToSubcategory}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Subsection Header with Breadcrumbs */}
      <SubsectionHeader
        categoryName="Mantenimientos básicos"
        subcategory={currentSubcategory}
        onBackToCategory={handleBackToCategory}
      />

      {/* Subcategories Navigation */}
      <SubCategoriesNavigation
        subcategories={maintenanceSubsections}
        activeSubcategory={activeSubcategory}
        onSubcategoryChange={setActiveSubcategory}
      />

      {/* Toolbar */}
      <PartsToolbar
        category={{
          id: 'maintenance',
          name: currentSubcategory.name,
          icon: 'Wrench',
          description: currentSubcategory.description,
          parts: currentSubcategory.parts
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        vehicleData={vehicleData}
        partsCount={filteredParts.length}
        cartItemsCount={cartItemsCount}
      />

      {/* Oil Types Navigation for oils subcategory */}
      {activeSubcategory === 'oils' && !showSubSubsections && (
        <div className="bg-gray-800 bg-opacity-70 rounded-lg p-4 border-l-4 border-red-600">
          <h4 className="text-lg font-bold text-red-600 mb-4">Tipos de Aceites</h4>
          
          {/* Desktop Navigation - Horizontal Tabs */}
          <div className="hidden md:block">
            <div className="flex flex-wrap gap-2">
              {oilsSubSubsections.map((oilType) => {
                const isActive = activeOilType === oilType.id;
                
                return (
                  <button
                    key={oilType.id}
                    onClick={() => setActiveOilType(oilType.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                      isActive
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                    }`}
                    title={oilType.description}
                  >
                    <span className="font-medium">{oilType.name}</span>
                    <span className="bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded-full">
                      {oilType.parts.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Navigation - Vertical List */}
          <div className="md:hidden space-y-2">
            {oilsSubSubsections.map((oilType) => {
              const isActive = activeOilType === oilType.id;
              
              return (
                <button
                  key={oilType.id}
                  onClick={() => setActiveOilType(oilType.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-red-600 bg-opacity-20 border-l-4 border-red-600 text-red-400'
                      : 'hover:bg-gray-700 hover:bg-opacity-50 text-gray-200 hover:text-white'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{oilType.name}</div>
                    <div className="text-xs text-gray-400 truncate">{oilType.description}</div>
                  </div>
                  <span className="bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded-full">
                    {oilType.parts.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Types Navigation for filters subcategory */}
      {activeSubcategory === 'filters' && !showSubSubsections && (
        <div className="bg-gray-800 bg-opacity-70 rounded-lg p-4 border-l-4 border-red-600">
          <h4 className="text-lg font-bold text-red-600 mb-4">Tipos de Filtros</h4>
          
          {/* Desktop Navigation - Horizontal Tabs */}
          <div className="hidden md:block">
            <div className="flex flex-wrap gap-2">
              {filtersSubSubsections.map((filterType) => {
                const isActive = activeFilterType === filterType.id;
                
                return (
                  <button
                    key={filterType.id}
                    onClick={() => setActiveFilterType(filterType.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                      isActive
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                    }`}
                    title={filterType.description}
                  >
                    <span className="font-medium">{filterType.name}</span>
                    <span className="bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded-full">
                      {filterType.parts.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Navigation - Vertical List */}
          <div className="md:hidden space-y-2">
            {filtersSubSubsections.map((filterType) => {
              const isActive = activeFilterType === filterType.id;
              
              return (
                <button
                  key={filterType.id}
                  onClick={() => setActiveFilterType(filterType.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-red-600 bg-opacity-20 border-l-4 border-red-600 text-red-400'
                      : 'hover:bg-gray-700 hover:bg-opacity-50 text-gray-200 hover:text-white'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{filterType.name}</div>
                    <div className="text-xs text-gray-400 truncate">{filterType.description}</div>
                  </div>
                  <span className="bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded-full">
                    {filterType.parts.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
