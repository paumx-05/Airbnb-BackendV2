// components/PartsSection.tsx
'use client';
import React, { useState } from 'react';
import CategoriesSidebar from './CategoriesSidebar';
import PartsContentArea from './PartsContentArea';
import { categories } from '@/lib/mocks/parts';
import { ViewMode, Part } from '@/lib/types/parts';

interface PartsSectionProps {
  vehicleData: {
    vin: string;
    brand: string;
    model: string;
    year: string;
  };
}

export default function PartsSection({ vehicleData }: PartsSectionProps) {
  const [activeCategory, setActiveCategory] = useState('maintenance');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<Part[]>([]);

  const currentCategory = categories.find(cat => cat.id === activeCategory);

  const handleAddToCart = (part: Part) => {
    setCartItems(prev => [...prev, part]);
  };

  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <CategoriesSidebar
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>
          
          {/* Content Area */}
          <div className="lg:col-span-3">
            <PartsContentArea
              category={currentCategory}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              vehicleData={vehicleData}
              onAddToCart={handleAddToCart}
              cartItemsCount={cartItems.length}
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
