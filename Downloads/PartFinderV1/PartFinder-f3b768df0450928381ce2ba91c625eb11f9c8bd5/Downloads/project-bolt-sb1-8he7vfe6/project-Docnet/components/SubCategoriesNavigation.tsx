// components/SubCategoriesNavigation.tsx
'use client';
import React from 'react';
import { SubCategory } from '@/lib/types/parts';
import { 
  Droplets, 
  Filter, 
  CircleStop, 
  Thermometer, 
  Zap, 
  Navigation, 
  Car, 
  Battery, 
  Wind 
} from 'lucide-react';

interface SubCategoriesNavigationProps {
  subcategories: SubCategory[];
  activeSubcategory: string;
  onSubcategoryChange: (subcategoryId: string) => void;
}

const iconMap = {
  Droplets,
  Filter,
  CircleStop,
  Thermometer,
  Zap,
  Navigation,
  Car,
  Battery,
  Wind,
};

export function SubCategoriesNavigation({ 
  subcategories, 
  activeSubcategory, 
  onSubcategoryChange 
}: SubCategoriesNavigationProps) {
  return (
    <div className="bg-gray-800 bg-opacity-70 rounded-lg p-4 border-l-4 border-red-600">
      <h4 className="text-md font-bold text-red-600 mb-4">Subsecciones</h4>
      
      {/* Desktop Navigation - Horizontal Tabs */}
      <div className="hidden md:block">
        <div className="flex flex-wrap gap-2">
          {subcategories.map((subcategory) => {
            const IconComponent = iconMap[subcategory.icon as keyof typeof iconMap];
            const isActive = activeSubcategory === subcategory.id;
            
            return (
              <button
                key={subcategory.id}
                onClick={() => onSubcategoryChange(subcategory.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
                title={subcategory.description}
              >
                <IconComponent className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{subcategory.name}</span>
                <span className="bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded-full">
                  {subcategory.parts.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Navigation - Vertical List */}
      <div className="md:hidden space-y-2">
        {subcategories.map((subcategory) => {
          const IconComponent = iconMap[subcategory.icon as keyof typeof iconMap];
          const isActive = activeSubcategory === subcategory.id;
          
          return (
            <button
              key={subcategory.id}
              onClick={() => onSubcategoryChange(subcategory.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 text-left ${
                isActive
                  ? 'bg-red-600 bg-opacity-20 border-l-4 border-red-600 text-red-400'
                  : 'hover:bg-gray-700 hover:bg-opacity-50 text-gray-200 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm flex items-center space-x-2">
                    <span>{subcategory.name}</span>
                    {subcategory.id === 'oils' && (
                      <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
                        + Subcategorías
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 truncate">{subcategory.description}</div>
                </div>
              </div>
              <span className="bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded-full">
                {subcategory.parts.length}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
