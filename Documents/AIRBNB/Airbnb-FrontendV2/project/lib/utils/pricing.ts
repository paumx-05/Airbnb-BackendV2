/**
 * Utilidades para cálculo de precios de reservas
 * Centraliza toda la lógica de cálculo de precios para mantener consistencia
 */

/**
 * Interfaz para los parámetros de cálculo de precios
 */
export interface PricingCalculationParams {
  pricePerNight: number;
  checkIn: string;
  checkOut: string;
  cleaningFeePercent?: number; // Por defecto 5%
  serviceFeePercent?: number; // Por defecto 8%
  taxesPercent?: number; // Por defecto 12%
}

/**
 * Interfaz para el resultado del cálculo de precios
 */
export interface PricingCalculationResult {
  totalNights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  total: number;
}

/**
 * Calcula el número de noches entre dos fechas
 * @param checkIn - Fecha de check-in (formato ISO string o Date)
 * @param checkOut - Fecha de check-out (formato ISO string o Date)
 * @returns Número de noches (entero, mínimo 1)
 */
export function calculateNights(checkIn: string | Date, checkOut: string | Date): number {
  const checkInDate = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
  const checkOutDate = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;
  
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
  const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  return nights > 0 ? nights : 1; // Mínimo 1 noche
}

/**
 * Calcula todos los precios de una reserva
 * Incluye subtotal, tarifa de limpieza, tarifa de servicio, impuestos y total
 * 
 * @param params - Parámetros para el cálculo de precios
 * @returns Objeto con todos los valores calculados
 * 
 * @example
 * const prices = calculateReservationPricing({
 *   pricePerNight: 50,
 *   checkIn: '2025-11-10',
 *   checkOut: '2025-11-15'
 * });
 * // Retorna: { totalNights: 5, subtotal: 250, cleaningFee: 12.5, serviceFee: 20, taxes: 30, total: 312.5 }
 */
export function calculateReservationPricing(
  params: PricingCalculationParams
): PricingCalculationResult {
  const {
    pricePerNight,
    checkIn,
    checkOut,
    cleaningFeePercent = 0.05, // 5%
    serviceFeePercent = 0.08, // 8%
    taxesPercent = 0.12 // 12%
  } = params;

  // Calcular número de noches
  const totalNights = calculateNights(checkIn, checkOut);

  // Calcular subtotal (precio por noche × número de noches)
  const subtotal = pricePerNight * totalNights;

  // Calcular tarifas e impuestos (sin redondear para mantener precisión)
  const cleaningFee = subtotal * cleaningFeePercent;
  const serviceFee = subtotal * serviceFeePercent;
  const taxes = subtotal * taxesPercent;

  // Calcular total final
  const total = subtotal + cleaningFee + serviceFee + taxes;

  return {
    totalNights,
    subtotal,
    cleaningFee,
    serviceFee,
    taxes,
    total
  };
}

/**
 * Formatea un número como moneda en formato EUR
 * @param amount - Cantidad a formatear
 * @param locale - Locale para el formato (por defecto 'es-ES')
 * @returns String formateado como moneda (ej: "50,00 €")
 */
export function formatCurrency(
  amount: number | undefined | null,
  locale: string = 'es-ES'
): string {
  // Si el valor es undefined, null o NaN, usar 0
  const safeAmount = amount ?? 0;
  
  if (isNaN(safeAmount) || !isFinite(safeAmount)) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(0);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(safeAmount);
}

/**
 * Calcula precios con valores del backend como fallback
 * Si los valores del backend están disponibles, los usa; si no, calcula localmente
 * 
 * @param params - Parámetros para el cálculo
 * @param backendValues - Valores opcionales del backend
 * @returns Objeto con todos los valores calculados
 */
export function calculatePricingWithFallback(
  params: PricingCalculationParams,
  backendValues?: {
    subtotal?: number | null;
    cleaningFee?: number | null;
    serviceFee?: number | null;
    taxes?: number | null;
    total?: number | null;
    totalNights?: number | null;
  }
): PricingCalculationResult {
  // Función helper para convertir valores a números de forma segura
  const toNumber = (value: any): number => {
    if (value === undefined || value === null) return 0;
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(num) || !isFinite(num) ? 0 : num;
  };

  // Calcular valores base
  const calculated = calculateReservationPricing(params);
  
  // Verificar si los valores vienen del backend (no son undefined/null)
  const hasBackendSubtotal = backendValues?.subtotal !== undefined && backendValues?.subtotal !== null;
  const hasBackendCleaningFee = backendValues?.cleaningFee !== undefined && backendValues?.cleaningFee !== null;
  const hasBackendServiceFee = backendValues?.serviceFee !== undefined && backendValues?.serviceFee !== null;
  const hasBackendTaxes = backendValues?.taxes !== undefined && backendValues?.taxes !== null;
  const hasBackendTotal = backendValues?.total !== undefined && backendValues?.total !== null;
  const hasBackendNights = backendValues?.totalNights !== undefined && backendValues?.totalNights !== null;

  // Usar valores del backend si existen, sino usar valores calculados
  return {
    totalNights: hasBackendNights ? toNumber(backendValues.totalNights) : calculated.totalNights,
    subtotal: hasBackendSubtotal ? toNumber(backendValues.subtotal) : calculated.subtotal,
    cleaningFee: hasBackendCleaningFee ? toNumber(backendValues.cleaningFee) : calculated.cleaningFee,
    serviceFee: hasBackendServiceFee ? toNumber(backendValues.serviceFee) : calculated.serviceFee,
    taxes: hasBackendTaxes ? toNumber(backendValues.taxes) : calculated.taxes,
    total: hasBackendTotal ? toNumber(backendValues.total) : calculated.total
  };
}

