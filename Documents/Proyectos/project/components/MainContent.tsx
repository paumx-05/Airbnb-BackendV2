import PropertyCard from './PropertyCard';
import MapToggle from './MapToggle';

/**
 * Main Content Component - Layout principal con propiedades y mapa
 * TODO: Implementar paginación para cargar más propiedades
 * FIXME: Agregar estados de carga y manejo de errores
 */

// Mock data siguiendo el estilo de la imagen de referencia
const luxuryProperties = [
  {
    id: '1',
    title: 'Exclusive Beach Villa - Balian Beach',
    location: 'Balian Beach, Bali',
    price: 850,
    rating: 4.7,
    image: 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Located 80 meters from Balian Beach and the famous surf break'
  },
  {
    id: '2',
    title: 'Cape Shark Villas, 4-10 pers.',
    location: 'Cape Town, South Africa',
    price: 2400,
    rating: 4.9,
    image: 'https://images.pexels.com/photos/3250613/pexels-photo-3250613.jpeg?auto=compress&cs=tinysrgb&w=800',
    guests: 4,
    description: 'The spacious villa of about 3000 sqft built in contemporary Thai style.'
  },
  {
    id: '3',
    title: 'Tropical Paradise Villa',
    location: 'Ubud, Bali',
    price: 1200,
    rating: 4.8,
    image: 'https://images.pexels.com/photos/2029719/pexels-photo-2029719.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Stunning villa surrounded by rice fields with infinity pool'
  },
  {
    id: '4',
    title: 'Modern Jungle Retreat',
    location: 'Tulum, Mexico',
    price: 950,
    rating: 4.9,
    image: 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Eco-luxury villa with private cenote access'
  }
];

export default function MainContent() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        
        {/* Properties Grid */}
        <div className="space-y-6 overflow-y-auto pr-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {luxuryProperties.map((property) => (
              <PropertyCard
                key={property.id}
                {...property}
              />
            ))}
          </div>
          
          {/* Load more properties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            {luxuryProperties.slice(0, 2).map((property, index) => (
              <PropertyCard
                key={`${property.id}-${index}`}
                {...property}
                id={`${property.id}-${index}`}
              />
            ))}
          </div>
        </div>

        {/* Map View */}
        <div className="hidden lg:block">
          <MapToggle />
        </div>
      </div>

      {/* Mobile Map Toggle */}
      <div className="lg:hidden mt-6">
        <button className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-xl transition-colors duration-200 font-medium">
          Show map
        </button>
      </div>
    </div>
  );
}