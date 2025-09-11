import VehiclePageClient from './VehiclePageClient';

// En tu página vehicle/[licensePlate]/page.tsx
export async function generateStaticParams() {
  // Genera algunos parámetros estáticos comunes para evitar errores
  return [
    { licensePlate: '0251FZL' },
    { licensePlate: 'ABC1234' },
    { licensePlate: 'XYZ5678' },
    { licensePlate: 'DEF9012' },
    { licensePlate: 'GHI3456' }
  ]
}

export default function VehiclePage({ params }: { params: { licensePlate: string } }) {
  return <VehiclePageClient licensePlate={params.licensePlate} />;
}
