import PropertyCard from './PropertyCard';

/**
 * Properties Grid Component - Display luxury properties
 * Features: Grid layout for villas, apartments, and private islands
 * TODO: Implement filtering and sorting functionality
 * FIXME: Add loading states and error handling for property data
 */

// Mock data for luxury properties - In production, this would come from an API
const luxuryProperties = [
  {
    id: '1',
    title: 'Oceanfront Villa Serenity',
    location: 'Bali, Indonesia',
    price: 850,
    rating: 4.9,
    image: 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'villa' as const,
    description: 'Stunning oceanfront villa with infinity pool and private beach access. Perfect for luxury getaways.'
  },
  {
    id: '2',
    title: 'Private Island Retreat',
    location: 'Maldives',
    price: 2400,
    rating: 5.0,
    image: 'https://images.pexels.com/photos/3250613/pexels-photo-3250613.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'island' as const,
    description: 'Exclusive private island with overwater bungalows and world-class amenities. Ultimate luxury experience.'
  },
  {
    id: '3',
    title: 'Penthouse Sky Loft',
    location: 'Dubai, UAE',
    price: 1200,
    rating: 4.8,
    image: 'https://images.pexels.com/photos/2029719/pexels-photo-2029719.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'apartment' as const,
    description: 'Luxurious penthouse with panoramic city views and premium amenities in the heart of Dubai.'
  },
  {
    id: '4',
    title: 'Cliffside Villa Paradise',
    location: 'Santorini, Greece',
    price: 950,
    rating: 4.9,
    image: 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'villa' as const,
    description: 'Breathtaking cliffside villa overlooking the Aegean Sea with traditional Cycladic architecture.'
  },
  {
    id: '5',
    title: 'Tropical Island Haven',
    location: 'Seychelles',
    price: 1800,
    rating: 4.9,
    image: 'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'island' as const,
    description: 'Secluded tropical island paradise with crystal-clear waters and pristine white sand beaches.'
  },
  {
    id: '6',
    title: 'Urban Luxury Suite',
    location: 'New York, USA',
    price: 750,
    rating: 4.7,
    image: 'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'apartment' as const,
    description: 'Sophisticated urban apartment in Manhattan with floor-to-ceiling windows and modern design.'
  }
];

export default function PropertiesGrid() {
  return (
    <section id="properties" className="py-20 bg-primario-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primario-100 mb-6">
            Exclusive Properties
          </h2>
          <p className="text-lg text-primario-200 max-w-3xl mx-auto">
            Discover handpicked luxury villas, premium apartments, and private islands 
            in the world's most sought-after destinations.
          </p>
        </div>

        {/* Properties Filter Tags */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {['All Properties', 'Luxury Villas', 'Premium Apartments', 'Private Islands'].map((filter) => (
            <button
              key={filter}
              className="px-6 py-2 rounded-full border border-primario-200/30 text-primario-100 hover:bg-acento-100 hover:text-texto-100 hover:border-acento-100 transition-all duration-200 font-medium text-sm"
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {luxuryProperties.map((property) => (
            <PropertyCard
              key={property.id}
              {...property}
            />
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-acento-100 hover:bg-acento-200 text-texto-100 font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-acento-100/30">
            Load More Properties
          </button>
        </div>
      </div>
    </section>
  );
}