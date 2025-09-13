'use client';

import { useReservationCart } from '@/context/ReservationCartContext';
import Header from '@/components/Header';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, Users, MapPin } from 'lucide-react';

/**
 * Página del Carrito de Reservas
 * Muestra todas las reservas guardadas y permite gestionarlas
 */
export default function CartPage() {
  const { items, removeFromCart, getTotalPrice, clearCart } = useReservationCart();

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Función para manejar el checkout
  const handleCheckout = () => {
    if (items.length === 0) {
      alert('No hay reservas en el carrito');
      return;
    }
    
    // Por simplicidad, redirigir al checkout de la primera reserva
    const firstItem = items[0];
    const params = new URLSearchParams({
      propertyId: firstItem.propertyId,
      checkIn: firstItem.checkIn,
      checkOut: firstItem.checkOut,
      guests: firstItem.guests.toString()
    });
    
    window.location.href = `/checkout?${params.toString()}`;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Tu carrito está vacío
            </h1>
            <p className="text-gray-600 mb-8">
              Agrega algunas reservas para comenzar tu viaje
            </p>
            <Link href="/">
              <Button className="bg-[#FF385C] hover:bg-[#E31C5F] text-white">
                Explorar Propiedades
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Mi Carrito de Reservas ({items.length})
          </h1>
          
          {items.length > 0 && (
            <Button
              variant="outline"
              onClick={clearCart}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar Carrito
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de reservas */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Imagen de la propiedad */}
                  <div className="md:w-48 flex-shrink-0">
                    <img
                      src={item.propertyImage}
                      alt={item.propertyTitle}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>

                  {/* Información de la reserva */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.propertyTitle}
                    </h3>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{item.propertyLocation}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Fechas */}
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <div className="text-sm">
                          <div>Check-in: {formatDate(item.checkIn)}</div>
                          <div>Check-out: {formatDate(item.checkOut)}</div>
                        </div>
                      </div>

                      {/* Huéspedes */}
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          {item.guests} huésped{item.guests > 1 ? 'es' : ''}
                        </span>
                      </div>

                      {/* Noches */}
                      <div className="text-gray-600">
                        <span className="text-sm">
                          {item.totalNights} noche{item.totalNights > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Precio */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        €{Math.round(item.subtotal / item.totalNights)} por noche × {item.totalNights} noches
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        €{item.total}
                      </div>
                    </div>
                  </div>

                  {/* Botón eliminar */}
                  <div className="flex items-start">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen del carrito */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Resumen del Carrito
              </h2>

              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">
                      {item.propertyTitle}
                    </span>
                    <span className="font-medium">€{item.total}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span>€{getTotalPrice()}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full mt-6 bg-[#FF385C] hover:bg-[#E31C5F] text-white"
              >
                Proceder al Checkout
              </Button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Podrás revisar y editar los detalles antes de confirmar
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
