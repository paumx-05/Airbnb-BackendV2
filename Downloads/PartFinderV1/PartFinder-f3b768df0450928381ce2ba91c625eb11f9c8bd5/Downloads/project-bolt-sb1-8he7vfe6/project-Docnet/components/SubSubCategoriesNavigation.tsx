// components/SubSubCategoriesNavigation.tsx
'use client';
import React from 'react';
import { SubSubCategory } from '@/lib/types/parts';
import { 
  Car, 
  Settings, 
  Cog, 
  Navigation 
} from 'lucide-react';

interface SubSubCategoriesNavigationProps {
  subsubcategories: SubSubCategory[];
  activeSubSubcategory: string;
  onSubSubcategoryChange: (subsubcategoryId: string) => void;
}

const iconMap = {
  Car,
  Settings,
  Cog,
  Navigation,
};

export default function SubSubCategoriesNavigation({ 
  subsubcategories, 
  activeSubSubcategory, 
  onSubSubcategoryChange 
}: SubSubCategoriesNavigationProps) {
  return (
    <div className="bg-gray-800 bg-opacity-70 rounded-lg p-4 border-l-4 border-red-600">
      <h5 className="text-sm font-bold text-red-600 mb-3">Tipos de Aceites</h5>
      
      {/* Desktop Navigation - Horizontal Tabs */}
      <div className="hidden md:block">
        <div className="flex flex-wrap gap-2">
          {subsubcategories.map((subsubcategory) => {
            const IconComponent = iconMap[subsubcategory.icon as keyof typeof iconMap];
            const isActive = activeSubSubcategory === subsubcategory.id;
            
            return (
              <button
                key={subsubcategory.id}
                onClick={() => onSubSubcategoryChange(subsubcategory.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-xs ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
                title={subsubcategory.description}
              >
                <IconComponent className="w-3 h-3 flex-shrink-0" />
                <span className="font-medium">{subsubcategory.name}</span>
                <span className="bg-gray-600 text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                  {subsubcategory.parts.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Navigation - Vertical List */}
      <div className="md:hidden space-y-2">
        {subsubcategories.map((subsubcategory) => {
          const IconComponent = iconMap[subsubcategory.icon as keyof typeof iconMap];
          const isActive = activeSubSubcategory === subsubcategory.id;
          
          return (
            <button
              key={subsubcategory.id}
              onClick={() => onSubSubcategoryChange(subsubcategory.id)}
              className={`w-full flex items-center justify-between p-2 rounded-lg transition-all duration-200 text-left ${
                isActive
                  ? 'bg-red-600 bg-opacity-20 border-l-4 border-red-600 text-red-400'
                  : 'hover:bg-gray-700 hover:bg-opacity-50 text-gray-200 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <IconComponent className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs">{subsubcategory.name}</div>
                  <div className="text-xs text-gray-400 truncate">{subsubcategory.description}</div>
                </div>
              </div>
              <span className="bg-gray-600 text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                {subsubcategory.parts.length}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
