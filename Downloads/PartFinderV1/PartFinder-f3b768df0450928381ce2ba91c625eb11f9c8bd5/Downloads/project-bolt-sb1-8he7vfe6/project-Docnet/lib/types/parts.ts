// lib/types/parts.ts
export interface Part {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  description: string;
  compatibility: string[];
  category: string;
  subcategory?: string;
  subsubcategory?: string;
  inStock: boolean;
  rating?: number;
}

export interface SubSubCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  parts: Part[];
}

export interface SubCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  parts: Part[];
  subsubcategories?: SubSubCategory[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  parts: Part[];
  subcategories?: SubCategory[];
}

export type ViewMode = 'grid' | 'list';

export interface PartsSectionProps {
  vehicleData: {
    vin: string;
    brand: string;
    model: string;
    year: string;
  };
}
