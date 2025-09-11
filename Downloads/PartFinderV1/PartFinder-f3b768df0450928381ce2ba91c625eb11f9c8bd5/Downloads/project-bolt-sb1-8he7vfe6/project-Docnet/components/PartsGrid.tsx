// components/PartsGrid.tsx
'use client';
import React from 'react';
import { Part } from '@/lib/types/parts';
import { PartCard } from './PartCard';

interface PartsGridProps {
  parts: Part[];
  onAddToCart?: (part: Part) => void;
}

export default function PartsGrid({ parts, onAddToCart }: PartsGridProps) {
  if (parts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No se encontraron recambios</p>
        <p className="text-gray-500 text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {parts.map((part) => (
        <PartCard
          key={part.id}
          part={part}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
