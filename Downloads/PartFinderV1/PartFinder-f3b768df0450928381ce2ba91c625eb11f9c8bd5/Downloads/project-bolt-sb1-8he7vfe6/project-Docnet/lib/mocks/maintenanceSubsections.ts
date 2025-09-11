// lib/mocks/maintenanceSubsections.ts
import { SubCategory, Part } from '@/lib/types/parts';
import { oilsSubSubsections } from './oilsSubSubsections';
import { filtersSubSubsections } from './filtersSubSubsections';

const generateMockParts = (subcategoryId: string, baseParts: Omit<Part, 'id' | 'category' | 'subcategory'>[]): Part[] => {
  return baseParts.map((part, index) => ({
    ...part,
    id: `${subcategoryId}-${index + 1}`,
    category: 'maintenance',
    subcategory: subcategoryId,
  }));
};

// Aceites
// Combine all oil products from subsubcategories
const oilsParts: Omit<Part, 'id' | 'category' | 'subcategory'>[] = oilsSubSubsections.flatMap(subsub => 
  subsub.parts.map(part => ({
    ...part,
    subsubcategory: subsub.id
  }))
);

// Filtros
// Combine all filter products from subsubcategories
const filtersParts: Omit<Part, 'id' | 'category' | 'subcategory'>[] = filtersSubSubsections.flatMap(subsub =>
  subsub.parts.map(part => ({
    ...part,
    subsubcategory: subsub.id
  }))
);

// Sistema de Frenos
const brakesParts: Omit<Part, 'id' | 'category' | 'subcategory'>[] = [
  {
    name: 'Pastillas de Freno Delanteras',
    brand: 'Brembo',
    price: 45.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    description: 'Juego de pastillas de freno delanteras, cerámicas',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.6,
  },
  {
    name: 'Discos de Freno',
    brand: 'Zimmermann',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&fit=crop',
    description: 'Par de discos de freno delanteros, ventilados',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.4,
  },
  {
    name: 'Líquido de Frenos DOT 4',
    brand: 'ATE',
    price: 12.50,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&fit=crop',
    description: 'Líquido de frenos DOT 4, 1L',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.3,
  },
];

// Sistema de Refrigeración
const coolingParts: Omit<Part, 'id' | 'category' | 'subcategory'>[] = [
  {
    name: 'Líquido Refrigerante Concentrado',
    brand: 'Prestone',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    description: 'Anticongelante concentrado, 5L, -37°C',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.1,
  },
  {
    name: 'Termostato 87°C',
    brand: 'Wahler',
    price: 22.99,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&fit=crop',
    description: 'Termostato, 87°C, con junta',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.2,
  },
  {
    name: 'Manguitos Refrigeración',
    brand: 'Gates',
    price: 35.50,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&fit=crop',
    description: 'Juego de manguitos de refrigeración',
    compatibility: ['Fiat Grande Punto'],
    inStock: false,
    rating: 4.0,
  },
];

// Correa Poli V
const beltParts: Omit<Part, 'id' | 'category' | 'subcategory'>[] = [
  {
    name: 'Correa de Accesorios 6PK1193',
    brand: 'Gates',
    price: 18.75,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    description: 'Correa de accesorios, 6PK1193',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.3,
  },
  {
    name: 'Correa de Distribución 4PK1095',
    brand: 'Continental',
    price: 35.99,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&fit=crop',
    description: 'Correa de distribución, 4PK1095',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.7,
  },
  {
    name: 'Tensores de Correa',
    brand: 'INA',
    price: 45.50,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&fit=crop',
    description: 'Tensores de correa de distribución',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.4,
  },
];

// Rótulas de Dirección
const steeringParts: Omit<Part, 'id' | 'category' | 'subcategory'>[] = [
  {
    name: 'Rótula de Dirección Inferior',
    brand: 'Lemförder',
    price: 28.50,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    description: 'Rótula de dirección inferior, con tornillo',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.2,
  },
  {
    name: 'Terminal de Dirección Exterior',
    brand: 'TRW',
    price: 22.99,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&fit=crop',
    description: 'Terminal de dirección exterior, roscado',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.4,
  },
  {
    name: 'Bieleta de Dirección',
    brand: 'Febi',
    price: 18.75,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&fit=crop',
    description: 'Bieleta de dirección, con rótulas',
    compatibility: ['Fiat Grande Punto'],
    inStock: false,
    rating: 4.1,
  },
];

// Rótulas de Suspensión
const suspensionParts: Omit<Part, 'id' | 'category' | 'subcategory'>[] = [
  {
    name: 'Amortiguador Delantero',
    brand: 'Bilstein',
    price: 125.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    description: 'Amortiguador delantero izquierdo, gas',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.7,
  },
  {
    name: 'Rótula de Suspensión',
    brand: 'Lemförder',
    price: 35.50,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&fit=crop',
    description: 'Rótula de suspensión inferior',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.3,
  },
  {
    name: 'Bieleta de Suspensión',
    brand: 'Febi',
    price: 42.99,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&fit=crop',
    description: 'Bieleta de suspensión trasera',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.2,
  },
];

// Batería
const batteryParts: Omit<Part, 'id' | 'category' | 'subcategory'>[] = [
  {
    name: 'Batería 12V 60Ah',
    brand: 'Varta',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    description: 'Batería de plomo-ácido, 12V 60Ah',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.5,
  },
  {
    name: 'Bornes de Batería',
    brand: 'Bosch',
    price: 12.50,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&fit=crop',
    description: 'Juego de bornes de batería, cobre',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.1,
  },
  {
    name: 'Cables de Batería',
    brand: 'Hella',
    price: 25.99,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&fit=crop',
    description: 'Cables de batería, 25mm²',
    compatibility: ['Fiat Grande Punto'],
    inStock: false,
    rating: 4.3,
  },
];

// Limpia Parabrisas
const wiperParts: Omit<Part, 'id' | 'category' | 'subcategory'>[] = [
  {
    name: 'Escobillas Delanteras',
    brand: 'Bosch',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    description: 'Juego de escobillas delanteras, 60cm',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.4,
  },
  {
    name: 'Líquido Limpiaparabrisas',
    brand: 'Sonax',
    price: 8.50,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&fit=crop',
    description: 'Líquido limpiaparabrisas, 5L, -20°C',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.2,
  },
  {
    name: 'Bomba Limpiaparabrisas',
    brand: 'Valeo',
    price: 35.99,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&fit=crop',
    description: 'Bomba de agua limpiaparabrisas',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.0,
  },
];

export const maintenanceSubsections: SubCategory[] = [
  {
    id: 'oils',
    name: 'Aceites',
    icon: 'Droplets',
    description: 'Aceite de motor, transmisión, diferencial, hidráulico',
    parts: generateMockParts('oils', oilsParts),
  },
  {
    id: 'filters',
    name: 'Filtros',
    icon: 'Filter',
    description: 'Filtro de aceite, aire, combustible, habitáculo',
    parts: generateMockParts('filters', filtersParts),
  },
  {
    id: 'brakes',
    name: 'Sistema de Frenos',
    icon: 'CircleStop',
    description: 'Pastillas, discos, líquido de frenos, latiguillos',
    parts: generateMockParts('brakes', brakesParts),
  },
  {
    id: 'cooling',
    name: 'Sistema de Refrigeración',
    icon: 'Thermometer',
    description: 'Líquido refrigerante, termostato, manguitos',
    parts: generateMockParts('cooling', coolingParts),
  },
  {
    id: 'belts',
    name: 'Correa Poli V',
    icon: 'Zap',
    description: 'Correa de accesorios, distribución, tensores',
    parts: generateMockParts('belts', beltParts),
  },
  {
    id: 'steering',
    name: 'Rótulas de Dirección',
    icon: 'Navigation',
    description: 'Rótulas, terminales, bieletas de dirección',
    parts: generateMockParts('steering', steeringParts),
  },
  {
    id: 'suspension',
    name: 'Rótulas de Suspensión',
    icon: 'Car',
    description: 'Rótulas, bieletas, amortiguadores',
    parts: generateMockParts('suspension', suspensionParts),
  },
  {
    id: 'battery',
    name: 'Batería',
    icon: 'Battery',
    description: 'Baterías, bornes, cables, alternadores',
    parts: generateMockParts('battery', batteryParts),
  },
  {
    id: 'wipers',
    name: 'Limpia Parabrisas',
    icon: 'Wind',
    description: 'Escobillas, líquido, bombas, manguitos',
    parts: generateMockParts('wipers', wiperParts),
  },
];
