/**
 * Servicios de API para pagos con Stripe
 * Conecta con el backend para gestionar pagos y transacciones
 */

import { apiClient } from './config';

// Interfaces para tipado de pagos
export interface CheckoutCalculateRequest {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface CheckoutCalculateResponse {
  success: boolean;
  data?: {
    subtotal: number;
    cleaningFee: number;
    serviceFee: number;
    taxes: number;
    total: number;
    totalNights: number;
  };
  message?: string;
}

export interface CreatePaymentIntentRequest {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  reservationId?: string;
}

export interface CreatePaymentIntentResponse {
  success: boolean;
  data?: {
    clientSecret: string;
    paymentIntentId: string;
  };
  message?: string;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
}

export interface ConfirmPaymentResponse {
  success: boolean;
  data?: {
    reservationId: string;
    bookingId: string;
    transactionId: string;
  };
  message?: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  reservationId?: string;
}

/**
 * Servicios de pagos que se conectan al backend real
 */
export const paymentService = {
  /**
   * Calcular el precio total de una reserva incluyendo impuestos y fees
   * POST /api/payments/checkout/calculate
   */
  async calculateCheckout(
    data: CheckoutCalculateRequest
  ): Promise<CheckoutCalculateResponse> {
    try {
      console.log('🔍 [paymentService] Calculando checkout...', data);
      
      const response = await apiClient.post<CheckoutCalculateResponse>(
        '/api/payments/checkout/calculate',
        data
      );
      
      if (response.success) {
        console.log('✅ [paymentService] Checkout calculado:', response.data?.total);
        return response;
      } else {
        console.log('❌ [paymentService] Error calculando checkout:', response.message);
        return response;
      }
    } catch (error) {
      console.error('💥 [paymentService] Error calculando checkout:', error);
      throw error;
    }
  },

  /**
   * Crear un Payment Intent en Stripe para iniciar el proceso de pago
   * POST /api/payments/checkout/create-intent
   * Retorna clientSecret para usar con Stripe.js
   */
  async createPaymentIntent(
    data: CreatePaymentIntentRequest
  ): Promise<CreatePaymentIntentResponse> {
    try {
      console.log('🔍 [paymentService] Creando payment intent...', data);
      console.log('🔍 [paymentService] Endpoint: POST /api/payments/checkout/create-intent');
      
      // Validar datos antes de enviar
      if (!data.propertyId || !data.checkIn || !data.checkOut || !data.guests) {
        const errorMsg = 'Faltan datos requeridos: propertyId, checkIn, checkOut, guests';
        console.error('❌ [paymentService]', errorMsg);
        return {
          success: false,
          message: errorMsg
        };
      }
      
      const response = await apiClient.post<CreatePaymentIntentResponse>(
        '/api/payments/checkout/create-intent',
        data
      );
      
      console.log('🔍 [paymentService] Respuesta recibida:', {
        success: response.success,
        hasData: !!response.data,
        hasClientSecret: !!response.data?.clientSecret,
        message: response.message
      });
      
      if (response.success && response.data?.clientSecret) {
        const clientSecret = response.data.clientSecret;
        const paymentIntentId = response.data.paymentIntentId;
        
        console.log('✅ [paymentService] Payment intent creado:', paymentIntentId);
        console.log('🔍 [paymentService] ClientSecret recibido (primeros 30 chars):', clientSecret.substring(0, 30) + '...');
        
        // Validar formato del clientSecret
        if (!clientSecret.includes('_secret_')) {
          const errorMsg = 'ClientSecret no tiene el formato correcto. Debe contener "_secret_"';
          console.error('❌ [paymentService]', errorMsg);
          return {
            success: false,
            message: errorMsg
          };
        }
        
        if (clientSecret.includes('_mock_') || clientSecret.startsWith('pi_mock')) {
          const errorMsg = 'El backend está devolviendo un clientSecret de prueba/mock. Verifica la configuración del backend.';
          console.error('❌ [paymentService] ⚠️ ADVERTENCIA:', errorMsg);
          return {
            success: false,
            message: errorMsg
          };
        }
        
        return response;
      } else {
        const errorMsg = response.message || 'Error creando el payment intent';
        console.error('❌ [paymentService] Error creando payment intent:', errorMsg);
        console.error('❌ [paymentService] Response completa:', JSON.stringify(response, null, 2));
        return {
          success: false,
          message: errorMsg
        };
      }
    } catch (error: any) {
      console.error('💥 [paymentService] Error creando payment intent:', error);
      
      // Manejar errores específicos
      let errorMessage = 'Error de conexión con el servidor';
      
      if (error.message) {
        if (error.message.includes('404') || error.message.includes('not found')) {
          errorMessage = 'El endpoint de pagos no está disponible. Verifica que el backend esté funcionando.';
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'No estás autenticado. Por favor, inicia sesión nuevamente.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:5000';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  /**
   * Confirmar el pago después de procesarlo con Stripe.js y crear/actualizar la reserva
   * POST /api/payments/checkout/confirm
   */
  async confirmPayment(
    data: ConfirmPaymentRequest
  ): Promise<ConfirmPaymentResponse> {
    try {
      console.log('🔍 [paymentService] Confirmando pago...', data);
      
      const response = await apiClient.post<ConfirmPaymentResponse>(
        '/api/payments/checkout/confirm',
        data
      );
      
      if (response.success && response.data) {
        console.log('✅ [paymentService] Pago confirmado:', response.data.reservationId);
        return response;
      } else {
        console.log('❌ [paymentService] Error confirmando pago:', response.message);
        return response;
      }
    } catch (error) {
      console.error('💥 [paymentService] Error confirmando pago:', error);
      throw error;
    }
  },

  /**
   * Obtener métodos de pago del usuario
   * GET /api/payments/methods
   */
  async getPaymentMethods(): Promise<{ success: boolean; data?: PaymentMethod[] }> {
    try {
      console.log('🔍 [paymentService] Obteniendo métodos de pago...');
      
      const response = await apiClient.get<{ 
        success: boolean; 
        data?: PaymentMethod[];
        message?: string;
      }>('/api/payments/methods');
      
      if (response.success) {
        console.log('✅ [paymentService] Métodos de pago obtenidos');
        return response;
      } else {
        console.log('❌ [paymentService] Error obteniendo métodos de pago:', response.message);
        return response;
      }
    } catch (error) {
      console.error('💥 [paymentService] Error obteniendo métodos de pago:', error);
      throw error;
    }
  },

  /**
   * Obtener historial de transacciones
   * GET /api/payments/transactions
   */
  async getTransactions(): Promise<{ success: boolean; data?: Transaction[] }> {
    try {
      console.log('🔍 [paymentService] Obteniendo transacciones...');
      
      const response = await apiClient.get<{ 
        success: boolean; 
        data?: Transaction[];
        message?: string;
      }>('/api/payments/transactions');
      
      if (response.success) {
        console.log('✅ [paymentService] Transacciones obtenidas');
        return response;
      } else {
        console.log('❌ [paymentService] Error obteniendo transacciones:', response.message);
        return response;
      }
    } catch (error) {
      console.error('💥 [paymentService] Error obteniendo transacciones:', error);
      throw error;
    }
  },

  /**
   * Obtener una transacción específica
   * GET /api/payments/transactions/:id
   */
  async getTransaction(id: string): Promise<{ success: boolean; data?: Transaction }> {
    try {
      console.log('🔍 [paymentService] Obteniendo transacción:', id);
      
      const response = await apiClient.get<{ 
        success: boolean; 
        data?: Transaction;
        message?: string;
      }>(`/api/payments/transactions/${id}`);
      
      if (response.success) {
        console.log('✅ [paymentService] Transacción obtenida');
        return response;
      } else {
        console.log('❌ [paymentService] Error obteniendo transacción:', response.message);
        return response;
      }
    } catch (error) {
      console.error('💥 [paymentService] Error obteniendo transacción:', error);
      throw error;
    }
  },

  /**
   * Procesar reembolso
   * POST /api/payments/transactions/:id/refund
   */
  async processRefund(transactionId: string): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('🔍 [paymentService] Procesando reembolso:', transactionId);
      
      const response = await apiClient.post<{ 
        success: boolean; 
        message?: string;
      }>(`/api/payments/transactions/${transactionId}/refund`);
      
      if (response.success) {
        console.log('✅ [paymentService] Reembolso procesado');
        return response;
      } else {
        console.log('❌ [paymentService] Error procesando reembolso:', response.message);
        return response;
      }
    } catch (error) {
      console.error('💥 [paymentService] Error procesando reembolso:', error);
      throw error;
    }
  }
};

