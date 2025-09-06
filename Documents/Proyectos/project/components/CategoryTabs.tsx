'use client';

import { useState } from 'react';
import { Mountain, Waves, Building2, TreePine, Wind as Windmill, Castle, Palmtree, Home, TrendingUp, Users, Filter } from 'lucide-react';

/**
 * Category Tabs Component - Filtros de categorías siguiendo diseño de referencia
 * TODO: Implementar filtrado real de propiedades por categoría
 * FIXME: Agregar scroll horizontal en móviles para todas las categorías
 */

const categories = [
  { id: 'amazing-views', name: 'Amazing views', icon: Mountain },
  { id: 'beachfront', name: 'Beachfront', icon: Waves },
  { id: 'amazing-pools', name: 'Amazing pools', icon: Waves },
  { id: 'farms', name: 'Farms', icon: TreePine },
  { id: 'windmills', name: 'Windmills', icon: Windmill },
  { id: 'mansions', name: 'Mansions', icon: Castle },
  { id: 'omg', name: 'OMG!', icon: Building2 },
  { id: 'iconic-cities', name: 'Iconic cities', icon: Building2 },
  { id: 'trending', name: 'Trending', icon: TrendingUp },
  { id: 'rooms', name: 'Rooms', icon: Home },
];

export default function CategoryTabs() {
  const [activeCategory, setActiveCategory] = useState('amazing-views');

  return (
    <div className="bg-slate-800/95 backdrop-blur-md border-b border-slate-700/50 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Categories */}
          <div className="flex items-center space-x-8 overflow-x-auto scrollbar-hide flex-1">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex flex-col items-center space-y-2 min-w-0 flex-shrink-0 pb-3 border-b-2 transition-all duration-200 ${
                    isActive 
                      ? 'border-white text-white' 
                      : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium whitespace-nowrap">{category.name}</span>
                </button>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4 ml-8">
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  className="rounded border-slate-600 bg-slate-700 text-[#FF385C] focus:ring-[#FF385C] focus:ring-offset-slate-800"
                />
                <span>Display total price</span>
              </label>
              <div className="text-xs text-slate-500">Includes all fees, before taxes</div>
            </div>
            
            <button className="flex items-center space-x-2 border border-slate-600 rounded-lg px-4 py-2 text-slate-300 hover:border-slate-500 hover:text-white transition-all duration-200">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}