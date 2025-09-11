// components/PartsList.tsx
'use client';
import React from 'react';
import { Part } from '@/lib/types/parts';
import { ShoppingCart, Star, Package } from 'lucide-react';

interface PartsListProps {
  parts: Part[];
  onAddToCart?: (part: Part) => void;
}

export default function PartsList({ parts, onAddToCart }: PartsListProps) {
  if (parts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No se encontraron recambios</p>
        <p className="text-gray-500 text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {parts.map((part) => (
        <div
          key={part.id}
          className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors duration-200 group"
        >
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Image */}
            <div className="flex-shrink-0">
              <img
                src={part.image}
                alt={part.name}
                className="w-24 h-24 object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/96x96/374151/9CA3AF?text=Sin+Imagen';
                }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg group-hover:text-red-400 transition-colors">
                    {part.name}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mt-1">
                    <span className="font-medium">{part.brand}</span>
                  </p>
                  
                  <p className="text-gray-300 text-sm mt-2 line-clamp-2">
                    {part.description}
                  </p>

                  {/* Compatibility */}
                  <div className="flex items-center space-x-1 mt-2 text-sm text-gray-400">
                    <Package className="w-4 h-4" />
                    <span>Compatible: {part.compatibility.join(', ')}</span>
                  </div>

                  {/* Rating */}
                  {part.rating && (
                    <div className="flex items-center space-x-1 mt-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-yellow-400 text-sm">{part.rating}</span>
                    </div>
                  )}
                </div>

                {/* Price and Actions */}
                <div className="flex flex-col items-end space-y-2 mt-4 md:mt-0">
                  <div className="text-2xl font-bold text-red-400">
                    €{part.price.toFixed(2)}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!part.inStock && (
                      <span className="text-red-400 text-sm">Agotado</span>
                    )}
                    
                    <button
                      onClick={() => onAddToCart?.(part)}
                      disabled={!part.inStock}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        part.inStock
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>{part.inStock ? 'Añadir al carrito' : 'Agotado'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
