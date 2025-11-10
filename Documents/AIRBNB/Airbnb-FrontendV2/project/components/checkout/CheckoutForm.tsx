'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { User, Mail, Phone, CreditCard, MessageSquare, AlertCircle } from 'lucide-react';
import { type GuestInfo } from '@/lib/types/reservation';
import { paymentService } from '@/lib/api/payments';

// Inicializar Stripe con la clave pública
// La clave se puede configurar en .env.local como NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
// Solo inicializar en el cliente para evitar problemas con SSR
let stripePromise: Promise<any> | null = null;

const getStripePromise = () => {
  if (typeof window === 'undefined') {
    console.log('⚠️ [CheckoutForm] getStripePromise: window no está disponible (SSR)');
    return null;
  }
  
  if (!stripePromise) {
    const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
      'pk_test_51SRF80BKr0sSqmIZYTdA95PzpoGwrJ9SRepCx70oDiZixvSxRGbGos40M2BQCCeuLY0vYnCYmkjavPYhU3wh0VsG00ehrDIg4J';
    
    if (!STRIPE_PUBLISHABLE_KEY) {
      console.error('❌ [CheckoutForm] No se encontró NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
      return null;
    }
    
    console.log('🔍 [CheckoutForm] Inicializando Stripe con clave pública (primeros 20 chars):', STRIPE_PUBLISHABLE_KEY.substring(0, 20) + '...');
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  
  return stripePromise;
};

interface CheckoutFormProps {
  onSubmit: (guestInfo: GuestInfo, reservationId?: string) => void;
  reservationData?: {
    propertyId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    total: number;
  };
}

// Componente interno que usa los hooks de Stripe
function PaymentForm({ onSubmit, reservationData }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [formData, setFormData] = useState<Omit<GuestInfo, 'cardNumber' | 'expiryDate' | 'cvv'>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    paymentMethod: 'credit',
    specialRequests: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isLoadingPaymentIntent, setIsLoadingPaymentIntent] = useState(false);

  // Función para crear el payment intent (memoizada para evitar recreaciones innecesarias)
  const createPaymentIntent = useCallback(async () => {
    if (!reservationData) {
      console.warn('⚠️ [PaymentForm] No hay reservationData para crear payment intent');
      return;
    }

    try {
      setIsLoadingPaymentIntent(true);
      setPaymentError(null);

      // Validar datos antes de llamar al servicio
      if (!reservationData.propertyId || !reservationData.checkIn || !reservationData.checkOut || !reservationData.guests) {
        const errorMsg = 'Faltan datos requeridos para crear el payment intent';
        console.error('❌ [PaymentForm]', errorMsg);
        setPaymentError(errorMsg);
        setIsLoadingPaymentIntent(false);
        return;
      }

      console.log('🔍 [PaymentForm] Creando payment intent con datos:', {
        propertyId: reservationData.propertyId,
        checkIn: reservationData.checkIn,
        checkOut: reservationData.checkOut,
        guests: reservationData.guests
      });

      const response = await paymentService.createPaymentIntent({
        propertyId: reservationData.propertyId,
        checkIn: reservationData.checkIn,
        checkOut: reservationData.checkOut,
        guests: reservationData.guests
      });

      console.log('🔍 [PaymentForm] Respuesta del servicio:', {
        success: response.success,
        hasData: !!response.data,
        message: response.message
      });

      if (response.success && response.data) {
        const { clientSecret, paymentIntentId } = response.data;
        
        // Validar que el clientSecret tenga el formato correcto de Stripe
        // Formato esperado: pi_xxxxx_secret_xxxxx
        if (!clientSecret || !clientSecret.includes('_secret_')) {
          console.error('❌ [PaymentForm] ClientSecret inválido:', clientSecret);
          setPaymentError('Error: El servidor devolvió un client secret inválido. Por favor, contacta al soporte.');
          setIsLoadingPaymentIntent(false);
          return;
        }
        
        // Validar que no sea un mock
        if (clientSecret.includes('_mock_') || clientSecret.startsWith('pi_mock')) {
          console.error('❌ [PaymentForm] ClientSecret es un mock:', clientSecret);
          setPaymentError('Error: El servidor está devolviendo datos de prueba. Verifica la configuración del backend.');
          setIsLoadingPaymentIntent(false);
          return;
        }
        
        console.log('✅ [PaymentForm] Payment intent creado:', paymentIntentId);
        console.log('✅ [PaymentForm] ClientSecret recibido (primeros 20 chars):', clientSecret.substring(0, 20) + '...');
        
        setClientSecret(clientSecret);
        setPaymentIntentId(paymentIntentId);
      } else {
        const errorMsg = response.message || 'Error creando el payment intent';
        console.error('❌ [PaymentForm] Error en respuesta:', errorMsg);
        setPaymentError(errorMsg);
      }
    } catch (error: any) {
      console.error('💥 [PaymentForm] Error creando payment intent:', error);
      setPaymentError(error.message || 'Error de conexión con el servidor. Verifica que el backend esté funcionando.');
    } finally {
      setIsLoadingPaymentIntent(false);
    }
  }, [reservationData]);

  // Crear payment intent cuando el componente se monta y stripe está disponible
  useEffect(() => {
    if (reservationData && stripe && !clientSecret && !isLoadingPaymentIntent) {
      console.log('🔍 [PaymentForm] Iniciando creación de payment intent...');
      createPaymentIntent();
    }
  }, [reservationData, stripe, clientSecret, isLoadingPaymentIntent, createPaymentIntent]);

  // Validaciones básicas
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return value.length < 2 ? 'Debe tener al menos 2 caracteres' : '';
      case 'email':
        return !value.includes('@') || !value.includes('.') ? 'Email válido requerido' : '';
      case 'phone':
        return value.length < 10 ? 'Número de teléfono válido requerido' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validar campo en tiempo real
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    setPaymentError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || !clientSecret || !paymentIntentId) {
      setPaymentError('Stripe no está inicializado. Por favor, recarga la página.');
      return;
    }

    setIsSubmitting(true);
    setPaymentError(null);

    // Validar todos los campos
    const newErrors: Record<string, string> = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'specialRequests') return; // Campo opcional
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Obtener el elemento de tarjeta
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setPaymentError('No se pudo encontrar el elemento de tarjeta');
      setIsSubmitting(false);
      return;
    }

    try {
      // Validar clientSecret antes de usarlo
      if (!clientSecret || !clientSecret.includes('_secret_')) {
        setPaymentError('Error: Client secret inválido. Por favor, recarga la página.');
        setIsSubmitting(false);
        return;
      }
      
      console.log('🔍 [PaymentForm] Confirmando pago con clientSecret (primeros 20 chars):', clientSecret.substring(0, 20) + '...');
      
      // Confirmar el pago con Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
          },
        },
      });

      if (stripeError) {
        console.error('Error de Stripe:', stripeError);
        setPaymentError(stripeError.message || 'Error procesando el pago');
        setIsSubmitting(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Confirmar el pago en el backend y crear la reserva
        const confirmResponse = await paymentService.confirmPayment({
          paymentIntentId: paymentIntentId,
          checkIn: reservationData!.checkIn,
          checkOut: reservationData!.checkOut,
          guests: reservationData!.guests,
          guestInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            specialRequests: formData.specialRequests || undefined
          }
        });

        if (confirmResponse.success && confirmResponse.data) {
          // Crear objeto GuestInfo para compatibilidad con el callback
          const guestInfo: GuestInfo = {
            ...formData,
            cardNumber: '****', // No guardamos el número real
            expiryDate: '**/**',
            cvv: '***'
          };
          
          // Pasar el reservationId al callback
          onSubmit(guestInfo, confirmResponse.data.reservationId);
        } else {
          setPaymentError(confirmResponse.message || 'Error confirmando la reserva');
        }
      } else {
        setPaymentError('El pago no se completó correctamente');
      }
    } catch (error: any) {
      console.error('Error procesando pago:', error);
      setPaymentError(error.message || 'Error procesando el pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Opciones de estilo para el CardElement de Stripe
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información personal */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-[#FF385C]" />
          Información del huésped
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C] transition-all ${
                errors.firstName ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="Tu nombre"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Apellido *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C] transition-all ${
                errors.lastName ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="Tu apellido"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>
      </section>

      {/* Información de contacto */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Mail className="w-5 h-5 mr-2 text-[#FF385C]" />
          Información de contacto
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C] transition-all ${
                errors.email ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="tu@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="w-4 h-4 inline mr-1" />
              Teléfono *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C] transition-all ${
                errors.phone ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="+1 (555) 123-4567"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
        </div>
      </section>

      {/* Información de pago con Stripe Elements */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-[#FF385C]" />
          Información de pago
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de pago
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C] transition-all hover:border-gray-400"
            >
              <option value="credit">Tarjeta de crédito</option>
              <option value="debit">Tarjeta de débito</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Datos de la tarjeta *
            </label>
            {!stripe ? (
              <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center min-h-[50px]">
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF385C]"></div>
                  <span className="text-sm">Inicializando Stripe...</span>
                </div>
              </div>
            ) : isLoadingPaymentIntent ? (
              <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center min-h-[50px]">
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF385C]"></div>
                  <span className="text-sm">Preparando formulario de pago...</span>
                </div>
              </div>
            ) : !clientSecret ? (
              <div className="px-4 py-3 border border-red-300 rounded-lg bg-red-50 flex items-center justify-center min-h-[50px]">
                <div className="flex flex-col items-center space-y-2 text-red-600">
                  <span className="text-sm font-medium">Error al cargar el formulario de pago</span>
                  <button
                    type="button"
                    onClick={createPaymentIntent}
                    className="text-xs underline hover:no-underline"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#FF385C] focus-within:border-[#FF385C] transition-all">
                <CardElement 
                  options={cardElementOptions}
                  onChange={(e) => {
                    if (e.error) {
                      setPaymentError(e.error.message);
                    } else {
                      setPaymentError(null);
                    }
                  }}
                />
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500">
              🔒 Tu información de pago está protegida y encriptada por Stripe
            </p>
          </div>
        </div>
      </section>

      {/* Solicitudes especiales */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-[#FF385C]" />
          Solicitudes especiales (opcional)
        </h3>
        
        <div>
          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-[#FF385C] transition-all hover:border-gray-400 resize-none"
            placeholder="¿Hay algo que el anfitrión deba saber? (ej: llegada tardía, necesidades especiales, etc.)"
          />
        </div>
      </section>

      {/* Mensaje de error de pago */}
      {paymentError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{paymentError}</p>
        </div>
      )}

      {/* Botón de envío */}
      <div className="pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting || !stripe || !clientSecret}
          className="w-full bg-[#FF385C] text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-[#E31C5F] focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Procesando pago...
            </div>
          ) : (
            'Confirmar reserva y pagar'
          )}
        </button>
        
        <p className="text-xs text-gray-500 text-center mt-3">
          Al confirmar, aceptas nuestros términos de servicio y política de cancelación
        </p>
      </div>
    </form>
  );
}

// Componente principal que envuelve con Elements
export default function CheckoutForm({ onSubmit, reservationData }: CheckoutFormProps) {
  // Solo renderizar en el cliente
  const [mounted, setMounted] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Verificar que la clave pública de Stripe esté disponible
    const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
      'pk_test_51SRF80BKr0sSqmIZYTdA95PzpoGwrJ9SRepCx70oDiZixvSxRGbGos40M2BQCCeuLY0vYnCYmkjavPYhU3wh0VsG00ehrDIg4J';
    
    if (!STRIPE_PUBLISHABLE_KEY) {
      setStripeError('Error: No se encontró la clave pública de Stripe. Verifica la configuración.');
      console.error('❌ [CheckoutForm] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY no está configurada');
    }
  }, []);

  const stripePromiseInstance = mounted ? getStripePromise() : null;

  if (!mounted) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  if (stripeError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{stripeError}</p>
          <p className="text-sm text-gray-500">Por favor, verifica la configuración de Stripe.</p>
        </div>
      </div>
    );
  }

  if (!stripePromiseInstance) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF385C] mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando Stripe...</p>
        </div>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#FF385C',
        colorBackground: '#ffffff',
        colorText: '#424770',
        colorDanger: '#df1b41',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
    locale: 'es',
  };

  return (
    <Elements stripe={stripePromiseInstance} options={options}>
      <PaymentForm onSubmit={onSubmit} reservationData={reservationData} />
    </Elements>
  );
}
