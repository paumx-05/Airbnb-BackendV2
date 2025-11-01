'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { propertyService, type Property, getLocationString } from '@/lib/api/properties';
import PropertyGallery from './PropertyGallery';
import HostInfo from './HostInfo';
import ReservationSidebar from './ReservationSidebar';

interface PropertyDetailProps {
  propertyId: string;
}

const PropertyDetail = ({ propertyId }: PropertyDetailProps) => {
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const propertyData = await propertyService.getPropertyById(propertyId);
        
        if (propertyData) {
          setProperty(propertyData);
          console.log('✅ [PropertyDetail] Propiedad cargada:', propertyData.title);
        } else {
          setError('Propiedad no encontrada');
          console.log('❌ [PropertyDetail] Propiedad no encontrada:', propertyId);
        }
      } catch (error) {
        console.error('💥 [PropertyDetail] Error cargando propiedad:', error);
        setError('Error cargando la propiedad');
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      loadProperty();
    }
  }, [propertyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Propiedad no encontrada'}
          </h1>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a resultados
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
        <div className="flex items-center gap-4 text-gray-600">
          <span className="flex items-center gap-1">
            <span className="text-yellow-500">⭐</span>
            <span className="font-medium">{property.rating}</span>
            <span>({property.reviewCount} reseñas)</span>
          </span>
          <span>•</span>
          <span>{getLocationString(property.location)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <PropertyGallery 
            images={[property.imageUrl]} 
            title={property.title} 
          />
          <HostInfo 
            host={property.host} 
            description={property.description}
            amenities={property.amenities}
          />
        </div>
        <div className="lg:col-span-1">
          <ReservationSidebar property={property} />
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
