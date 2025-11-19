// src/types/index.ts - Refactored for Phase 1

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  role: 'customer' | 'provider' | 'admin';
  is_phone_verified: boolean;
  is_email_verified: boolean;
  profile_picture?: string;
  address?: string;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  phone: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role: 'customer' | 'provider';
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ============================================
// Service Types
// ============================================

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  is_active: boolean;
  created_at: string;
}

export interface ServiceProvider {
  id: string;
  business_name: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  average_rating: string;
  total_ratings: number;
  verified_at: string | null;
  created_at: string;
}

// Quantity option for one-time orders
export interface QuantityOption {
  label: string;  // "250ml", "1 Liter", "2 Liters"
  value: number;  // 0.25, 1, 2
  price: string;  // "15.00", "60.00", "120.00"
}

export interface Service {
  id: string;
  provider: ServiceProvider;
  category: ServiceCategory;
  name: string;
  description: string;
  base_price: string;
  unit: string;
  quantity_options: QuantityOption[];
  minimum_order: number;
  is_active: boolean;
  is_available: boolean;
  has_stock_tracking: boolean;
  current_stock: number;
  business_hours_start: string;
  business_hours_end: string;
  operating_days: string[];
  supports_immediate_delivery: boolean;
  immediate_delivery_time: number;
  supports_prepaid_cards: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceListItem {
  id: string;
  name: string;
  provider_name: string;
  category_name: string;
  base_price: string;
  unit: string;
  is_available: boolean;
  current_stock: number;
  supports_immediate_delivery: boolean;
  supports_prepaid_cards: boolean;
}

// ============================================
// Prepaid Card Types (NEW!)
// ============================================

export interface PrepaidCardOption {
  id: string;
  service: string;
  service_name: string;
  name: string;
  total_units: string;
  price: string;
  price_per_unit: string;
  savings: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface PrepaidCard {
  id: string;
  customer: User;
  card_option: PrepaidCardOption;
  status: 'active' | 'exhausted' | 'cancelled';
  total_units: string;
  used_units: string;
  remaining_units: string;
  total_amount: string;
  per_unit_price: string;
  purchased_at: string;
  last_used_at?: string;
  exhausted_at?: string;
  cancelled_at?: string;
}

export interface PrepaidCardListItem {
  id: string;
  service_name: string;
  card_name: string;
  status: 'active' | 'exhausted' | 'cancelled';
  total_units: string;
  used_units: string;
  remaining_units: string;
  purchased_at: string;
  last_used_at?: string;
}

export interface CardUsage {
  id: string;
  card: string;
  units_used: string;
  marked_by: string;
  marked_by_name: string;
  notes: string;
  used_at: string;
}

export interface CreatePrepaidCardRequest {
  card_option_id: string;
}

export interface UseCardRequest {
  units: number;
  notes?: string;
}

// ============================================
// Order Types
// ============================================

export interface Order {
  id: string;
  order_number: string;
  customer: User;
  service: ServiceListItem;
  status: 'pending' | 'confirmed' | 'processing' | 'out_for_delivery' | 'completed' | 'cancelled' | 'refunded';
  quantity: string;
  quantity_label: string;
  unit_price: string;
  total_amount: string;
  delivery_type: 'immediate' | 'scheduled';
  delivery_address: string;
  scheduled_date?: string;
  scheduled_time?: string;
  expected_delivery_time?: string;
  notes: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  completed_at?: string;
  cancelled_at?: string;
}

export interface OrderListItem {
  id: string;
  order_number: string;
  customer_name: string;
  service_name: string;
  status: string;
  delivery_type: string;
  quantity: string;
  quantity_label: string;
  total_amount: string;
  scheduled_date?: string;
  created_at: string;
}

export interface CreateOrderRequest {
  service_id: string;
  quantity: number;
  quantity_label: string;
  delivery_type: 'immediate' | 'scheduled';
  delivery_address: string;
  scheduled_date?: string;
  scheduled_time?: string;
  notes?: string;
}

// ============================================
// Payment Types
// ============================================

export interface Payment {
  id: string;
  transaction_id: string;
  customer: User;
  order?: OrderListItem;
  prepaid_card?: PrepaidCardListItem;
  amount: string;
  payment_method: 'cash' | 'upi' | 'card' | 'wallet' | 'netbanking';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  gateway_name?: string;
  gateway_transaction_id?: string;
  notes: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface PaymentListItem {
  id: string;
  transaction_id: string;
  customer_name: string;
  amount: string;
  payment_method: string;
  status: string;
  created_at: string;
}