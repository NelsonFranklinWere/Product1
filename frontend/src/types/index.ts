export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  business_name: string;
  business_type: string;
  location: string;
  phone_number?: string;
  subscription_tier: 'free' | 'basic' | 'premium' | 'enterprise';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: number;
  name: string;
  phone_number: string;
  facebook_id: string;
  email: string;
  notes: string;
  tags: string[];
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: number;
  contact: Contact;
  source_platform: 'whatsapp' | 'facebook';
  platform_conversation_id: string;
  is_resolved: boolean;
  is_archived: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assigned_to?: number;
  last_message_at: string;
  created_at: string;
  unread_count: number;
  messages?: Message[];
}

export interface Message {
  id: number;
  text: string;
  timestamp: string;
  direction: 'inbound' | 'outbound';
  message_type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'location' | 'contact' | 'template';
  platform_message_id: string;
  is_read: boolean;
  is_delivered: boolean;
  is_failed: boolean;
  failure_reason: string;
  metadata: Record<string, any>;
  reply_to?: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  short_description: string;
  price: string;
  currency: string;
  category?: ProductCategory;
  category_id?: number;
  sku: string;
  unit: string;
  is_digital: boolean;
  is_service: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  image_url: string;
  image_file?: string;
  gallery: string[];
  is_active: boolean;
  is_featured: boolean;
  is_available: boolean;
  meta_title: string;
  meta_description: string;
  tags: string[];
  view_count: number;
  share_count: number;
  inquiry_count: number;
  variants: ProductVariant[];
  is_low_stock: boolean;
  is_out_of_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  description: string;
  parent?: number;
  is_active: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: number;
  name: string;
  sku: string;
  price_modifier: string;
  stock_quantity: number;
  is_active: boolean;
  metadata: Record<string, any>;
  final_price: string;
}

export interface Transaction {
  id: number;
  amount: string;
  currency: string;
  description: string;
  checkout_request_id: string;
  merchant_request_id: string;
  mpesa_receipt_number: string;
  transaction_date?: string;
  phone_number: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'timeout';
  error_message: string;
  customer_name: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  is_expired: boolean;
  is_successful: boolean;
}

export interface PaymentRequest {
  id: number;
  transaction: Transaction;
  reason: string;
  due_date?: string;
  is_urgent: boolean;
  reminder_sent: boolean;
  reminder_count: number;
  last_reminder_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UsageLog {
  id: number;
  date: string;
  whatsapp_business_initiated: number;
  whatsapp_user_initiated: number;
  whatsapp_template_messages: number;
  facebook_messages_sent: number;
  facebook_messages_received: number;
  mpesa_transaction_count: number;
  mpesa_transaction_value: string;
  mpesa_successful_transactions: number;
  mpesa_failed_transactions: number;
  conversations_created: number;
  messages_sent: number;
  messages_received: number;
  products_shared: number;
  total_whatsapp_messages: number;
  total_messages: number;
  mpesa_success_rate: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessMetrics {
  id: number;
  date: string;
  new_customers: number;
  active_customers: number;
  returning_customers: number;
  total_conversations: number;
  resolved_conversations: number;
  average_response_time?: string;
  total_sales: string;
  successful_payments: number;
  failed_payments: number;
  products_viewed: number;
  products_shared: number;
  product_inquiries: number;
  resolution_rate: number;
  payment_success_rate: number;
  created_at: string;
  updated_at: string;
}

export interface MessageTemplate {
  id: number;
  name: string;
  content: string;
  category: 'greeting' | 'product_info' | 'pricing' | 'support' | 'payment' | 'follow_up' | 'custom';
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppTemplate {
  id: number;
  template_name: string;
  template_id: string;
  category: 'AUTHENTICATION' | 'MARKETING' | 'UTILITY';
  language: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISABLED';
  components: any[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  data: any;
}

export interface NewMessageEvent {
  type: 'new_message';
  conversation_id: number;
  message: Message;
}

export interface PaymentNotificationEvent {
  type: 'payment_notification';
  transaction_id: number;
  status: string;
  amount: string;
  phone_number: string;
  receipt_number: string;
  message: string;
}

export interface TypingIndicatorEvent {
  type: 'typing_indicator';
  conversation_id: number;
  is_typing: boolean;
  user_id: string;
}