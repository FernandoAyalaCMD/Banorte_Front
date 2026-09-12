/**
 * Mock Payloads for Demo Mode
 * Static A2UI payloads for the 4 use cases + success card.
 * Activated when EXPO_PUBLIC_MOCK_MODE=true
 */

import type { A2UIPayload } from '../types/a2ui';

export const MOCK_TRIGGERS: Record<string, A2UIPayload> = {
  // ── SafeCart Keywords ──
  'tarjeta desechable': mockBurnerCard(),
  'safecart': mockBurnerCard(),
  'tarjeta temporal': mockBurnerCard(),
  'tarjeta virtual': mockBurnerCard(),
  'compra segura': mockBurnerCard(),

  // ── Sentinel Keywords ──
  'fraude': mockFraudAlert(),
  'cargo no reconocido': mockFraudAlert(),
  'sentinel': mockFraudAlert(),
  'bloquear tarjeta': mockFraudAlert(),
  'desconocer cargo': mockFraudAlert(),

  // ── Subscriptions Keywords ──
  'suscripciones': mockSubscriptions(),
  'suscripcion': mockSubscriptions(),
  'cargos recurrentes': mockSubscriptions(),
  'cancelar suscripcion': mockSubscriptions(),
  'subscriptions': mockSubscriptions(),

  // ── Payroll Keywords ──
  'adelanto': mockPayrollAdvance(),
  'nomina': mockPayrollAdvance(),
  'adelanto de nomina': mockPayrollAdvance(),
  'prestamo': mockPayrollAdvance(),
  'necesito dinero': mockPayrollAdvance(),
};

export function findMockPayload(text: string): A2UIPayload | null {
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const [keyword, payload] of Object.entries(MOCK_TRIGGERS)) {
    const normalizedKeyword = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (lower.includes(normalizedKeyword)) {
      return {
        ...payload,
        actionId: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      };
    }
  }
  return null;
}

export function mockBurnerCard(): A2UIPayload {
  return {
    component: 'BurnerCard',
    actionId: 'mock-burner-001',
    voice_script: 'Listo, he generado tu tarjeta virtual desechable. Tienes 10 minutos para usarla. El CVV es dinámico, toca para revelarlo.',
    props: {
      cardNumber: '4815162342981234',
      cardHolder: 'FERNANDO AYALA',
      expiryDate: '12/26',
      cvv: '847',
      spendingLimit: 5000,
      remainingSeconds: 600,
      brand: 'visa' as const,
    },
  };
}

export function mockFraudAlert(): A2UIPayload {
  return {
    component: 'FraudAlertView',
    actionId: 'mock-fraud-001',
    voice_script: 'Detecté una transacción sospechosa en tu tarjeta terminación 7741. He congelado tu tarjeta preventivamente. Revisa los detalles y selecciona los cargos que no reconozcas.',
    props: {
      cardInfo: {
        id: 'card-001',
        lastFour: '7741',
        type: 'Crédito Oro',
        isFrozen: true,
      },
      suspiciousTransaction: {
        id: 'tx-suspicious-001',
        merchant: 'ALIEXPRESS HK',
        amount: 12450.00,
        currency: 'MXN',
        date: '12 Sep 2026, 01:34 AM',
        location: 'Hong Kong, China',
        category: 'Compras en línea',
      },
      recentTransactions: [
        {
          id: 'tx-001',
          merchant: 'OXXO Insurgentes',
          amount: 185.50,
          date: '11 Sep, 8:23 PM',
          isVerified: true,
        },
        {
          id: 'tx-002',
          merchant: 'Uber Eats',
          amount: 342.00,
          date: '11 Sep, 2:15 PM',
          isVerified: true,
        },
        {
          id: 'tx-003',
          merchant: 'Steam Games',
          amount: 899.00,
          date: '10 Sep, 11:45 PM',
          isVerified: true,
        },
        {
          id: 'tx-004',
          merchant: 'Amazon MX',
          amount: 2150.00,
          date: '10 Sep, 6:30 PM',
          isVerified: true,
        },
        {
          id: 'tx-005',
          merchant: 'WISH.COM',
          amount: 3200.00,
          date: '10 Sep, 3:12 AM',
          isVerified: false,
        },
      ],
      plasticEnabled: false,
    },
  };
}

export function mockSubscriptions(): A2UIPayload {
  return {
    component: 'SubscriptionManager',
    actionId: 'mock-subs-001',
    voice_script: 'Encontré 5 suscripciones activas en tu cuenta. Estás gastando 1,547 pesos al mes. Desactiva las que ya no uses para ahorrar.',
    props: {
      subscriptions: [
        {
          id: 'sub-001',
          serviceName: 'Netflix Premium',
          monthlyCost: 299,
          nextChargeDate: '15 Sep',
          isActive: true,
          category: 'streaming' as const,
        },
        {
          id: 'sub-002',
          serviceName: 'Spotify Family',
          monthlyCost: 189,
          nextChargeDate: '18 Sep',
          isActive: true,
          category: 'music' as const,
        },
        {
          id: 'sub-003',
          serviceName: 'Xbox Game Pass',
          monthlyCost: 249,
          nextChargeDate: '20 Sep',
          isActive: true,
          category: 'gaming' as const,
        },
        {
          id: 'sub-004',
          serviceName: 'iCloud+ 200GB',
          monthlyCost: 49,
          nextChargeDate: '1 Oct',
          isActive: true,
          category: 'cloud' as const,
        },
        {
          id: 'sub-005',
          serviceName: 'Disney+ Estándar',
          monthlyCost: 219,
          nextChargeDate: '5 Oct',
          isActive: true,
          category: 'streaming' as const,
        },
        {
          id: 'sub-006',
          serviceName: 'Calm Premium',
          monthlyCost: 149,
          nextChargeDate: '10 Oct',
          isActive: true,
          category: 'fitness' as const,
        },
        {
          id: 'sub-007',
          serviceName: 'HBO Max',
          monthlyCost: 199,
          nextChargeDate: '12 Oct',
          isActive: true,
          category: 'streaming' as const,
        },
        {
          id: 'sub-008',
          serviceName: 'Dropbox Plus',
          monthlyCost: 194,
          nextChargeDate: '14 Oct',
          isActive: true,
          category: 'cloud' as const,
        },
      ],
      totalMonthlySpend: 1547,
    },
  };
}

export function mockPayrollAdvance(): A2UIPayload {
  return {
    component: 'PayrollAdvance',
    actionId: 'mock-payroll-001',
    voice_script: 'Tienes pre-aprobado un adelanto de nómina de hasta 15,000 pesos. Ajusta el monto con el slider y elige el plazo de pago que te convenga.',
    props: {
      maxAmount: 15000,
      minAmount: 1000,
      defaultAmount: 8000,
      disbursementDate: '12 Sep 2026',
      installmentOptions: [
        {
          installments: 1,
          paymentPerPeriod: 8240,
          commission: 240,
          annualRate: 18,
          totalRepayment: 8240,
        },
        {
          installments: 2,
          paymentPerPeriod: 4180,
          commission: 360,
          annualRate: 24,
          totalRepayment: 8360,
        },
      ],
      employerName: 'Tecnológico de Monterrey',
    },
  };
}

export function mockResolutionSuccess(): A2UIPayload {
  return {
    component: 'ResolutionSuccessCard',
    actionId: 'mock-success-001',
    voice_script: 'Listo, tu solicitud ha sido procesada exitosamente.',
    props: {
      title: '¡Operación Exitosa!',
      description: 'Tu solicitud ha sido procesada correctamente. Recibirás un comprobante por correo electrónico.',
      details: [
        { label: 'Operación', value: 'Adelanto de Nómina' },
        { label: 'Monto', value: '$8,000.00 MXN' },
        { label: 'Comisión', value: '$240.00 MXN' },
        { label: 'Fecha de dispersión', value: '12 Sep 2026' },
      ],
      folio: 'BNT-2026-09-12-A4F7',
      type: 'advance' as const,
    },
  };
}
