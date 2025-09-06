/**
 * Map Section Component - Visual representation inspired by the reference image
 * Features: Interactive map-like display showing property locations
 * TODO: Integrate with Google Maps API for real coordinates
 * FIXME: Optimize map markers positioning for mobile devices
 */

export default function MapSection() {
  // Mock property locations for the map visualization
  const propertyLocations = [
    { id: '1', name: 'Villa Serenity', price: '$850', x: '25%', y: '35%' },
    { id: '2', name: 'Island Retreat', price: '$2,400', x: '70%', y: '20%' },
    { id: '3', name: 'Sky Penthouse', price: '$1,200', x: '45%', y: '60%' },
    { id: '4', name: 'Cliffside Villa', price: '$950', x: '15%', y: '75%' },
    { id: '5', name: 'Tropical Haven', price: '$1,800', x: '80%', y: '45%' },
    { id: '6', name: 'Urban Suite', price: '$750', x: '35%', y: '25%' }
  ];

  return (
    <section className="py-20 bg-texto-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primario-100 mb-6">
            Prime Locations
          </h2>
          <p className="text-lg text-primario-200 max-w-3xl mx-auto">
            All our luxury properties are strategically located in the most exclusive areas, 
            offering unparalleled access to premium amenities and breathtaking views.
          </p>
        </div>

        {/* Map Container */}
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-card rounded-3xl p-8 shadow-2xl border border-primario-200/20 overflow-hidden">
            {/* Map Background */}
            <div className="relative h-[500px] sm:h-[600px] bg-gradient-to-br from-acento-100/20 via-primario-200/30 to-acento-200/20 rounded-2xl overflow-hidden">
              
              {/* Geographic features simulation */}
              <div className="absolute top-10 left-10 w-32 h-20 bg-acento-100/30 rounded-full blur-sm"></div>
              <div className="absolute top-32 right-20 w-40 h-24 bg-acento-200/20 rounded-full blur-sm"></div>
              <div className="absolute bottom-20 left-20 w-28 h-16 bg-primario-200/40 rounded-full blur-sm"></div>
              <div className="absolute bottom-32 right-32 w-36 h-22 bg-acento-100/25 rounded-full blur-sm"></div>

              {/* Grid overlay for map feel */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(113, 196, 239, 0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(113, 196, 239, 0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px'
                }}
              />

              {/* Property Markers */}
              {propertyLocations.map((location) => (
                <div
                  key={location.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                  style={{ left: location.x, top: location.y }}
                >
                  {/* Marker Pin */}
                  <div className="relative">
                    <div className="w-6 h-6 bg-acento-100 rounded-full border-2 border-white shadow-lg group-hover:scale-125 transition-transform duration-200 flex items-center justify-center">
                      <div className="w-3 h-3 bg-texto-100 rounded-full"></div>
                    </div>
                    
                    {/* Price tooltip */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-texto-100 text-primario-100 px-3 py-1 rounded-lg text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg border border-primario-200/20">
                      {location.price}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-texto-100"></div>
                    </div>

                    {/* Pulse animation */}
                    <div className="absolute inset-0 w-6 h-6 bg-acento-100 rounded-full animate-ping opacity-20"></div>
                  </div>
                </div>
              ))}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur-sm rounded-lg p-4 border border-primario-200/20">
                <h4 className="text-sm font-semibold text-primario-100 mb-2">Property Types</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-acento-100 rounded-full"></div>
                    <span className="text-primario-200">Luxury Properties</span>
                  </div>
                </div>
              </div>

              {/* Zoom controls */}
              <div className="absolute top-4 right-4 flex flex-col bg-card/80 backdrop-blur-sm rounded-lg border border-primario-200/20 overflow-hidden">
                <button className="p-3 hover:bg-primario-200/10 text-primario-100 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                <div className="h-px bg-primario-200/20"></div>
                <button className="p-3 hover:bg-primario-200/10 text-primario-100 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Map Statistics */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { label: 'Countries', value: '25+' },
            { label: 'Cities', value: '150+' },
            { label: 'Beach Properties', value: '200+' },
            { label: 'Mountain Retreats', value: '100+' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-acento-100 mb-1">{stat.value}</div>
              <div className="text-sm text-primario-200">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}