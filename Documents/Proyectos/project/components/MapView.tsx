'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

/**
 * Map View Component - Mapa interactivo siguiendo diseño de referencia
 * TODO: Integrar con Google Maps API para coordenadas reales
 * FIXME: Optimizar rendimiento de marcadores en móviles
 */

const mapProperties = [
  { id: '1', price: '$850', x: '15%', y: '25%' },
  { id: '2', price: '$2,400', x: '25%', y: '35%' },
  { id: '3', price: '$1,200', x: '35%', y: '45%' },
  { id: '4', price: '$950', x: '45%', y: '55%' },
  { id: '5', price: '$1,800', x: '55%', y: '35%' },
  { id: '6', price: '$750', x: '65%', y: '65%' },
  { id: '7', price: '$1,150', x: '75%', y: '25%' },
  { id: '8', price: '$890', x: '85%', y: '45%' },
];

export default function MapView() {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  return (
    <div className="relative h-full bg-slate-700 rounded-xl overflow-hidden">
      {/* Map Background - Mapa realista mejorado */}
      <div 
        className="w-full h-full bg-cover bg-center relative"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 600'%3E%3Cdefs%3E%3Cfilter id='blur' x='-50%25' y='-50%25' width='200%25' height='200%25'%3E%3CfeGaussianBlur in='SourceGraphic' stdDeviation='2'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='%23E8F4F8'/%3E%3C!-- Calles principales --%3E%3Cpath d='M0,150 L1000,150' stroke='%23D1D5DB' stroke-width='8' opacity='0.8'/%3E%3Cpath d='M0,300 L1000,300' stroke='%23D1D5DB' stroke-width='12' opacity='0.9'/%3E%3Cpath d='M0,450 L1000,450' stroke='%23D1D5DB' stroke-width='8' opacity='0.8'/%3E%3Cpath d='M200,0 L200,600' stroke='%23D1D5DB' stroke-width='10' opacity='0.8'/%3E%3Cpath d='M400,0 L400,600' stroke='%23D1D5DB' stroke-width='8' opacity='0.7'/%3E%3Cpath d='M600,0 L600,600' stroke='%23D1D5DB' stroke-width='10' opacity='0.8'/%3E%3Cpath d='M800,0 L800,600' stroke='%23D1D5DB' stroke-width='8' opacity='0.7'/%3E%3C!-- Calles secundarias --%3E%3Cpath d='M0,75 L1000,75' stroke='%23E5E7EB' stroke-width='4' opacity='0.6'/%3E%3Cpath d='M0,225 L1000,225' stroke='%23E5E7EB' stroke-width='4' opacity='0.6'/%3E%3Cpath d='M0,375 L1000,375' stroke='%23E5E7EB' stroke-width='4' opacity='0.6'/%3E%3Cpath d='M0,525 L1000,525' stroke='%23E5E7EB' stroke-width='4' opacity='0.6'/%3E%3Cpath d='M100,0 L100,600' stroke='%23E5E7EB' stroke-width='3' opacity='0.5'/%3E%3Cpath d='M300,0 L300,600' stroke='%23E5E7EB' stroke-width='3' opacity='0.5'/%3E%3Cpath d='M500,0 L500,600' stroke='%23E5E7EB' stroke-width='3' opacity='0.5'/%3E%3Cpath d='M700,0 L700,600' stroke='%23E5E7EB' stroke-width='3' opacity='0.5'/%3E%3Cpath d='M900,0 L900,600' stroke='%23E5E7EB' stroke-width='3' opacity='0.5'/%3E%3C!-- Parques y areas verdes --%3E%3Crect x='50' y='50' width='120' height='80' fill='%2334D399' opacity='0.3' rx='8'/%3E%3Crect x='750' y='400' width='200' height='150' fill='%2334D399' opacity='0.3' rx='12'/%3E%3Crect x='300' y='200' width='150' height='100' fill='%2334D399' opacity='0.3' rx='8'/%3E%3C!-- Lagos/rios --%3E%3Cellipse cx='150' cy='450' rx='80' ry='40' fill='%233B82F6' opacity='0.4'/%3E%3Cpath d='M500,500 Q600,480 700,500 Q800,520 900,500' stroke='%233B82F6' stroke-width='20' fill='none' opacity='0.3'/%3E%3C!-- Edificios importantes --%3E%3Crect x='380' y='280' width='40' height='40' fill='%236B7280' opacity='0.6' rx='4'/%3E%3Crect x='580' y='130' width='60' height='40' fill='%236B7280' opacity='0.6' rx='4'/%3E%3Crect x='180' y='180' width='35' height='35' fill='%236B7280' opacity='0.6' rx='4'/%3E%3C/svg%3E")`,
        }}
      >
        {/* Sombra de profundidad para el mapa */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5"></div>

        {/* Property Price Markers */}
        {mapProperties.map((property) => (
          <button
            key={property.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded-full text-sm font-bold transition-all duration-200 hover:scale-110 shadow-lg ${
              selectedProperty === property.id
                ? 'bg-red-500 text-white border-2 border-white ring-2 ring-red-200'
                : 'bg-white text-gray-800 hover:bg-red-50 border border-gray-200 hover:border-red-300'
            }`}
            style={{ left: property.x, top: property.y }}
            onClick={() => setSelectedProperty(
              selectedProperty === property.id ? null : property.id
            )}
          >
            {property.price}
          </button>
        ))}

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
          <button className="p-3 hover:bg-gray-100 transition-colors duration-200 border-b border-gray-200">
            <Plus className="h-4 w-4 text-gray-700" />
          </button>
          <button className="p-3 hover:bg-gray-100 transition-colors duration-200">
            <Minus className="h-4 w-4 text-gray-700" />
          </button>
        </div>

        {/* Map attribution */}
        <div className="absolute bottom-2 right-2 text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded">
          Map data ©2024
        </div>
      </div>
    </div>
  );
}