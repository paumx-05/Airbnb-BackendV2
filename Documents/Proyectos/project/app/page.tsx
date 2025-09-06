import Header from '@/components/Header';
import OfferTopBar from '@/components/OfferTopBar';
import CategoryTabs from '@/components/CategoryTabs';
import MainContent from '@/components/MainContent';

/**
 * Main Landing Page Component - Página principal siguiendo diseño de referencia
 * Features: Header con búsqueda, tabs de categorías, grid de propiedades y mapa
 * Architecture: Layout exacto de la imagen de referencia de Airbnb
 * 
 * TODO: Agregar SEO metadata y datos estructurados
 * FIXME: Implementar boundaries de error para producción
 * TODO: Agregar tracking de analytics para interacciones de usuario
 */

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-800">
      {/* Offer TopBar */}
      <OfferTopBar 
        discount={45}
        remainingSpots={15}
        timeLimit={120}
        offerText="¡Oferta Flash! Reserva ahora y ahorra"
      />
      
      {/* Navigation Header */}
      <Header />
      
      {/* Category Filters */}
      <CategoryTabs />
      
      {/* Main Content: Properties + Map */}
      <MainContent />
    </main>
  );
}