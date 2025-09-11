// lib/mocks/oilsSubSubsections.ts
import { SubSubCategory, Part } from '@/lib/types/parts';

const generateMockParts = (subsubcategoryId: string, baseParts: Omit<Part, 'id' | 'category' | 'subcategory' | 'subsubcategory'>[]): Part[] => {
  return baseParts.map((part, index) => ({
    ...part,
    id: `${subsubcategoryId}-${index + 1}`,
    category: 'maintenance',
    subcategory: 'oils',
    subsubcategory: subsubcategoryId,
  }));
};

// Aceite Motor
const engineOilParts: Omit<Part, 'id' | 'category' | 'subcategory' | 'subsubcategory'>[] = [
  {
    name: 'Aceite Motor 5W-30 Sintético',
    brand: 'Castrol',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    description: 'Aceite sintético para motor, 5W-30, 4L, API SN/CF, ideal para motores modernos',
    compatibility: ['Fiat Grande Punto 1.4'],
    inStock: true,
    rating: 4.5,
  },
  {
    name: 'Aceite Motor 10W-40 Mineral',
    brand: 'Repsol',
    price: 18.50,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    description: 'Aceite mineral para motor, 10W-40, 4L, API SL/CF',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.2,
  },
  {
    name: 'Aceite Motor 15W-40 Semi-Sintético',
    brand: 'Mobil',
    price: 22.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    description: 'Aceite semi-sintético para motor, 15W-40, 4L, API SN/CF',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.3,
  },
  {
    name: 'Aceite Motor 0W-20 Sintético',
    brand: 'Shell',
    price: 28.75,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    description: 'Aceite sintético para motor, 0W-20, 4L, API SN/GF-6A',
    compatibility: ['Fiat Grande Punto'],
    inStock: false,
    rating: 4.6,
  },
];

// Aceite Transmisión
const transmissionOilParts: Omit<Part, 'id' | 'category' | 'subcategory' | 'subsubcategory'>[] = [
  {
    name: 'Aceite Transmisión 75W-90',
    brand: 'Motul',
    price: 32.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    description: 'Aceite para caja de cambios manual, 75W-90, 1L, GL-4',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.7,
  },
  {
    name: 'Aceite Transmisión 80W-90',
    brand: 'Valvoline',
    price: 28.50,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    description: 'Aceite para caja de cambios, 80W-90, 1L, GL-4',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.4,
  },
  {
    name: 'Aceite Transmisión 75W-80',
    brand: 'Fuchs',
    price: 35.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    description: 'Aceite para caja de cambios manual, 75W-80, 1L, GL-4',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.5,
  },
  {
    name: 'Aceite Transmisión Automática ATF',
    brand: 'Castrol',
    price: 42.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    description: 'Aceite para transmisión automática, ATF, 1L',
    compatibility: ['Fiat Grande Punto'],
    inStock: false,
    rating: 4.3,
  },
];

// Aceite Diferencial
const differentialOilParts: Omit<Part, 'id' | 'category' | 'subcategory' | 'subsubcategory'>[] = [
  {
    name: 'Aceite Diferencial 80W-90',
    brand: 'Valvoline',
    price: 28.75,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    description: 'Aceite para diferencial, 80W-90, 1L, GL-5',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.3,
  },
  {
    name: 'Aceite Diferencial 85W-140',
    brand: 'Mobil',
    price: 32.50,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    description: 'Aceite para diferencial, 85W-140, 1L, GL-5',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.4,
  },
  {
    name: 'Aceite Diferencial 75W-90',
    brand: 'Motul',
    price: 35.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    description: 'Aceite para diferencial, 75W-90, 1L, GL-5',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.6,
  },
  {
    name: 'Aceite Diferencial LSD',
    brand: 'Red Line',
    price: 45.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    description: 'Aceite para diferencial autoblocante, 75W-90, 1L',
    compatibility: ['Fiat Grande Punto'],
    inStock: false,
    rating: 4.7,
  },
];

// Aceite Dirección
const steeringOilParts: Omit<Part, 'id' | 'category' | 'subcategory' | 'subsubcategory'>[] = [
  {
    name: 'Aceite Dirección ATF',
    brand: 'Castrol',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    description: 'Aceite para dirección asistida, ATF, 1L',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.2,
  },
  {
    name: 'Aceite Hidráulico Dirección',
    brand: 'Pentosin',
    price: 25.50,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    description: 'Aceite hidráulico para dirección, 1L',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.4,
  },
  {
    name: 'Aceite Dirección Especial',
    brand: 'Fuchs',
    price: 22.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    description: 'Aceite especial para dirección asistida, 1L',
    compatibility: ['Fiat Grande Punto'],
    inStock: true,
    rating: 4.1,
  },
  {
    name: 'Aceite Dirección Universal',
    brand: 'Mannol',
    price: 15.75,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
    description: 'Aceite universal para dirección, 1L',
    compatibility: ['Fiat Grande Punto'],
    inStock: false,
    rating: 3.9,
  },
];

export const oilsSubSubsections: SubSubCategory[] = [
  {
    id: 'engine-oil',
    name: 'Aceite Motor',
    icon: 'Car',
    description: '5W-30, 10W-40, 15W-40, sintético, mineral, semi-sintético',
    parts: generateMockParts('engine-oil', engineOilParts),
  },
  {
    id: 'transmission-oil',
    name: 'Aceite Transmisión',
    icon: 'Settings',
    description: '75W-90, 80W-90, 75W-80, para caja de cambios manual y automática',
    parts: generateMockParts('transmission-oil', transmissionOilParts),
  },
  {
    id: 'differential-oil',
    name: 'Aceite Diferencial',
    icon: 'Cog',
    description: '80W-90, 85W-140, 75W-90, para diferenciales delanteros y traseros',
    parts: generateMockParts('differential-oil', differentialOilParts),
  },
  {
    id: 'steering-oil',
    name: 'Aceite Dirección',
    icon: 'Navigation',
    description: 'ATF, aceite hidráulico, para dirección asistida',
    parts: generateMockParts('steering-oil', steeringOilParts),
  },
];
