'use client';

import { useState } from 'react';
import { Map, MapPin } from 'lucide-react';
import MapView from './MapView';
import EnhancedMapView from './EnhancedMapView';

/**
 * MapToggle Component - Permite alternar entre versiones del mapa
 */
export default function MapToggle() {
  const [isEnhanced, setIsEnhanced] = useState(false);

  return (
    <div className="relative h-full">
      {/* Toggle Button */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-white rounded-full shadow-lg border border-gray-200 p-1">
        <button
          onClick={() => setIsEnhanced(false)}
          className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            !isEnhanced
              ? 'bg-blue-500 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          <Map className="h-4 w-4 inline mr-1" />
          Básico
        </button>
        <button
          onClick={() => setIsEnhanced(true)}
          className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            isEnhanced
              ? 'bg-blue-500 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          <MapPin className="h-4 w-4 inline mr-1" />
          Detallado
        </button>
      </div>

      {/* Map Content */}
      <div className="h-full">
        {isEnhanced ? <EnhancedMapView /> : <MapView />}
      </div>
    </div>
  );
}





