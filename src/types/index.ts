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

// Service Types
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

export interface Service {
  id: string;
  provider: ServiceProvider;
  category: ServiceCategory;
  name: string;
  description: string;
  pricing_type: 'per_unit' | 'subscription' | 'both';
  base_price: string;
  unit: string;
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
}

// Subscription Package Types
export interface SubscriptionPackage {
  id: string;
  service: string;
  service_name: string;
  name: string;
  units: number;
  price: string;
  price_per_unit: string;
  savings: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

// Subscription Types
export interface Subscription {
  id: string;
  customer: User;
  package: SubscriptionPackage;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  delivery_type: 'self_pickup' | 'auto_delivery';
  total_units: number;
  used_units: number;
  remaining_units: number;
  total_amount: string;
  per_unit_price: string;
  delivery_address?: string;
  preferred_time?: string;
  delivery_days?: string[];
  units_per_delivery?: number;
  usage_history?: SubscriptionUsage[];
  created_at: string;
  updated_at: string;
  paused_at?: string;
  completed_at?: string;
  cancelled_at?: string;
}

export interface SubscriptionListItem {
  id: string;
  service_name: string;
  package_name: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  delivery_type: 'self_pickup' | 'auto_delivery';
  total_units: number;
  used_units: number;
  remaining_units: number;
  created_at: string;
}

export interface SubscriptionUsage {
  id: string;
  subscription: string;
  units_used: number;
  usage_type: 'pickup' | 'delivered';
  picked_up_at?: string;
  delivered_at?: string;
  delivered_by?: string;
  notes: string;
  created_at: string;
}

export interface CreateSubscriptionRequest {
  package_id: string;
  delivery_type: 'self_pickup' | 'auto_delivery';
  delivery_address?: string;
  preferred_time?: string;
  delivery_days?: string[];
  units_per_delivery?: number;
}

// Order Types
export interface Order {
  id: string;
  order_number: string;
  customer: User;
  service: ServiceListItem;
  order_type: 'one_time';
  status: 'pending' | 'confirmed' | 'processing' | 'out_for_delivery' | 'completed' | 'cancelled' | 'refunded';
  quantity: number;
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
  service_name: string;
  status: string;
  total_amount: string;
  delivery_date?: string;
  created_at: string;
}

export interface CreateOrderRequest {
  service_id: string;
  order_type: 'one_time';
  quantity: number;
  delivery_type: 'immediate' | 'scheduled';
  delivery_address: string;
  scheduled_date?: string;
  scheduled_time?: string;
  notes?: string;
}

// Payment Types
export interface Payment {
  id: string;
  transaction_id: string;
  customer: User;
  order?: OrderListItem;
  subscription?: SubscriptionListItem;
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