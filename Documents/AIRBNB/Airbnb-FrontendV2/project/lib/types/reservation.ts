/**
 * Tipos compartidos para reservas
 * No contiene lógica mock, solo definiciones de tipos
 */

export interface ReservationProperty {
  id: string;
  title: string;
  location: string;
  pricePerNight: number;
  image: string;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  description?: string;
  amenities?: string[];
}

export interface ReservationData {
  checkIn: string;
  checkOut: string;
  guests: number;
  propertyId: string;
  totalNights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  total: number;
}

export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  paymentMethod: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  specialRequests?: string;
}

