/**
 * A2UI Protocol Type System
 * Defines the contract between the LLM backend (MCP) and the React Native frontend.
 * Every interaction follows: User → LLM → A2UIPayload → Render → User Action → A2UIEvent → LLM
 */

// ─── Component Names ────────────────────────────────────────────────────────────

export type ComponentName =
  | 'BurnerCard'
  | 'FraudAlertView'
  | 'SubscriptionManager'
  | 'PayrollAdvance'
  | 'ResolutionSuccessCard'
  | 'DynamicBankView';

// ─── A2UI Payload (LLM → Frontend) ─────────────────────────────────────────────

export interface A2UIPayload {
  /** Component to render from the registry */
  component: ComponentName;
  /** Dynamic props to inject into the component */
  props: ComponentPropsMap[ComponentName];
  /** Unique action ID for closing the interaction loop */
  actionId: string;
  /** Short script for ElevenLabs TTS */
  voice_script?: string;
  /** Audio URL or base64 data URI for ElevenLabs playback */
  audio_url?: string;
}

// ─── A2UI Event (Frontend → LLM) ───────────────────────────────────────────────

export interface A2UIEvent {
  /** References the actionId from the originating payload */
  actionId: string;
  /** Type of user interaction */
  eventType: A2UIEventType;
  /** Event-specific data */
  payload: Record<string, unknown>;
  /** ISO timestamp of the interaction */
  timestamp: number;
}

export type A2UIEventType =
  | 'button_press'
  | 'switch_toggle'
  | 'slider_change'
  | 'checkbox_toggle'
  | 'copy_action'
  | 'selection_change'
  | 'dismiss'
  | 'go_home';

// ─── Message Types ──────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content?: string;
  a2uiPayload?: A2UIPayload;
  timestamp: number;
}

// ─── API Response ───────────────────────────────────────────────────────────────

export interface A2UIResponse {
  success: boolean;
  payload?: A2UIPayload;
  error?: string;
}

// ─── onAction callback ─────────────────────────────────────────────────────────

export type OnActionCallback = (
  eventType: A2UIEventType,
  payload: Record<string, unknown>
) => void;

// ─── Component Props Map ────────────────────────────────────────────────────────

export interface ComponentPropsMap {
  BurnerCard: BurnerCardProps;
  FraudAlertView: FraudAlertViewProps;
  SubscriptionManager: SubscriptionManagerProps;
  PayrollAdvance: PayrollAdvanceProps;
  ResolutionSuccessCard: ResolutionSuccessCardProps;
  DynamicBankView: DynamicBankViewProps;
}

// ─── BurnerCard Props (SafeCart) ────────────────────────────────────────────────

export interface BurnerCardProps {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  /** Spending limit in MXN */
  spendingLimit: number;
  /** Remaining seconds until card expires (max 600 = 10 min) */
  remainingSeconds: number;
  /** Card brand for logo */
  brand: 'visa' | 'mastercard';
}

// ─── FraudAlertView Props (Sentinel) ────────────────────────────────────────────

export interface FraudAlertViewProps {
  /** Card info for the frozen card */
  cardInfo: {
    id: string;
    lastFour: string;
    type: string;
    isFrozen: boolean;
  };
  /** The suspicious transaction */
  suspiciousTransaction: {
    id: string;
    merchant: string;
    amount: number;
    currency: string;
    date: string;
    location: string;
    category: string;
  };
  /** Recent transactions for review */
  recentTransactions: Array<{
    id: string;
    merchant: string;
    amount: number;
    date: string;
    isVerified: boolean;
  }>;
  /** Whether physical plastic is currently enabled */
  plasticEnabled: boolean;
}

// ─── SubscriptionManager Props ──────────────────────────────────────────────────

export interface SubscriptionItem {
  id: string;
  serviceName: string;
  /** URL or local asset for the logo */
  logoUrl?: string;
  /** Monthly cost in MXN */
  monthlyCost: number;
  /** Next charge date */
  nextChargeDate: string;
  /** Whether subscription is currently active */
  isActive: boolean;
  /** Category for grouping */
  category: 'streaming' | 'music' | 'gaming' | 'cloud' | 'fitness' | 'other';
}

export interface SubscriptionManagerProps {
  subscriptions: SubscriptionItem[];
  /** Total monthly spend on subscriptions */
  totalMonthlySpend: number;
}

// ─── PayrollAdvance Props ───────────────────────────────────────────────────────

export interface PayrollInstallmentOption {
  /** Number of installments (1 or 2 quincenas) */
  installments: number;
  /** Per-installment payment */
  paymentPerPeriod: number;
  /** Commission in MXN */
  commission: number;
  /** Annual interest rate */
  annualRate: number;
  /** Total to repay */
  totalRepayment: number;
}

export interface PayrollAdvanceProps {
  /** Maximum approved amount */
  maxAmount: number;
  /** Minimum amount */
  minAmount: number;
  /** Pre-positioned default amount */
  defaultAmount: number;
  /** Estimated disbursement date */
  disbursementDate: string;
  /** Available installment options */
  installmentOptions: PayrollInstallmentOption[];
  /** Employer name */
  employerName: string;
}

// ─── ResolutionSuccessCard Props ────────────────────────────────────────────────

export interface ResolutionSuccessCardProps {
  /** Title for the success message */
  title: string;
  /** Description or confirmation text */
  description: string;
  /** Key-value details to display */
  details: Array<{
    label: string;
    value: string;
  }>;
  /** Confirmation/folio number */
  folio?: string;
  /** Type of resolution for icon selection */
  type: 'payment' | 'card' | 'subscription' | 'dispute' | 'advance';
}


// --- DynamicBankView Props (Generative UI) ---

export interface DynamicElement {
  type: 'header' | 'text' | 'key_value' | 'bar_chart' | 'action_button';
  content?: string;
  label?: string;
  value?: string | number;
  data?: Array<{ label: string; value: number }>;
  action?: string;
}

export interface DynamicBankViewProps {
  title: string;
  subtitle?: string;
  elements: DynamicElement[];
}
