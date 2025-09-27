import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { 
  User, 
  Conversation, 
  Message, 
  Contact, 
  Product, 
  Transaction, 
  PaymentRequest,
  UsageLog,
  BusinessMetrics,
  MessageTemplate,
  WhatsAppTemplate,
  ApiResponse,
  PaginatedResponse
} from '@/types'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Token ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Add response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          window.location.href = '/'
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async register(data: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    business_name: string;
    business_type: string;
    location: string;
    phone_number?: string;
  }): Promise<{ user: User; token: string }> {
    const response = await this.client.post('/api/auth/register/', data)
    return response.data
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.client.post('/api/auth/login/', { email, password })
    return response.data
  }

  async logout(): Promise<void> {
    await this.client.delete('/api/auth/logout/')
  }

  async getProfile(): Promise<User> {
    const response = await this.client.get('/api/auth/profile/')
    return response.data
  }

  // Conversations endpoints
  async getConversations(): Promise<Conversation[]> {
    const base = process.env.NEXT_PUBLIC_CONVERSATIONS_BASE || '/api/communications'
    const response = await this.client.get(`${base}/conversations/`)
    return response.data.results || response.data
  }

  async getConversation(id: number): Promise<Conversation> {
    const base = process.env.NEXT_PUBLIC_CONVERSATIONS_BASE || '/api/communications'
    const response = await this.client.get(`${base}/conversations/${id}/`)
    return response.data
  }

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    const base = process.env.NEXT_PUBLIC_CONVERSATIONS_BASE || '/api/communications'
    const response = await this.client.get(`${base}/conversations/${conversationId}/messages/`)
    return response.data.results || response.data
  }

  async sendMessage(conversationId: number, message: string, messageType: string = 'text'): Promise<Message> {
    const base = process.env.NEXT_PUBLIC_CONVERSATIONS_BASE || '/api/communications'
    const response = await this.client.post(`${base}/conversations/${conversationId}/send-message/`, {
      message,
      message_type: messageType
    })
    return response.data.message
  }

  async markMessageRead(messageId: number): Promise<void> {
    const base = process.env.NEXT_PUBLIC_CONVERSATIONS_BASE || '/api/communications'
    await this.client.patch(`${base}/messages/${messageId}/mark-read/`)
  }

  // Contacts endpoints
  async getContacts(): Promise<Contact[]> {
    const base = process.env.NEXT_PUBLIC_CONVERSATIONS_BASE || '/api/communications'
    const response = await this.client.get(`${base}/contacts/`)
    return response.data.results || response.data
  }

  async getContact(id: number): Promise<Contact> {
    const base = process.env.NEXT_PUBLIC_CONVERSATIONS_BASE || '/api/communications'
    const response = await this.client.get(`${base}/contacts/${id}/`)
    return response.data
  }

  async updateContact(id: number, data: Partial<Contact>): Promise<Contact> {
    const base = process.env.NEXT_PUBLIC_CONVERSATIONS_BASE || '/api/communications'
    const response = await this.client.patch(`${base}/contacts/${id}/`, data)
    return response.data
  }

  // Products endpoints
  async getProducts(): Promise<Product[]> {
    const response = await this.client.get('/api/products/')
    return response.data.results || response.data
  }

  async getProduct(id: number): Promise<Product> {
    const response = await this.client.get(`/api/products/${id}/`)
    return response.data
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    const response = await this.client.post('/api/products/', data)
    return response.data
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    const response = await this.client.patch(`/api/products/${id}/`, data)
    return response.data
  }

  async deleteProduct(id: number): Promise<void> {
    await this.client.delete(`/api/products/${id}/`)
  }

  async shareProduct(productId: number, conversationId: number): Promise<void> {
    await this.client.post(`/api/products/${productId}/share/`, {
      conversation_id: conversationId
    })
  }

  // Transactions endpoints
  async getTransactions(): Promise<Transaction[]> {
    const response = await this.client.get('/api/payments/transactions/')
    return response.data.results || response.data
  }

  async getTransaction(id: number): Promise<Transaction> {
    const response = await this.client.get(`/api/payments/transactions/${id}/`)
    return response.data
  }

  async initiateSTKPush(data: {
    phone_number: string;
    amount: number;
    account_reference?: string;
    transaction_desc?: string;
    conversation_id?: number;
    product_id?: number;
  }): Promise<{ transaction: Transaction; checkout_request_id: string; customer_message: string }> {
    const response = await this.client.post('/api/payments/mpesa/stk-push/', data)
    return response.data
  }

  async querySTKPushStatus(checkoutRequestId: string): Promise<Transaction> {
    const response = await this.client.post('/api/payments/mpesa/query-status/', {
      checkout_request_id: checkoutRequestId
    })
    return response.data.transaction
  }

  async requestPaymentFromConversation(conversationId: number, data: {
    amount: number;
    reason?: string;
    product_id?: number;
  }): Promise<{ transaction_id: number; checkout_request_id: string; customer_message: string }> {
    const response = await this.client.post(`/api/payments/request-payment/${conversationId}/`, data)
    return response.data
  }

  // Analytics endpoints
  async getUsageLogs(): Promise<UsageLog[]> {
    const response = await this.client.get('/api/analytics/usage/')
    return response.data.results || response.data
  }

  async getCurrentUsage(): Promise<{ today: UsageLog; month_total: any }> {
    const response = await this.client.get('/api/analytics/usage/current/')
    return response.data
  }

  async getBusinessMetrics(): Promise<BusinessMetrics[]> {
    const response = await this.client.get('/api/analytics/metrics/')
    return response.data.results || response.data
  }

  async getCurrentMetrics(): Promise<{ today: BusinessMetrics; week_averages: any }> {
    const response = await this.client.get('/api/analytics/metrics/current/')
    return response.data
  }

  async getAnalyticsDashboard(): Promise<any> {
    const response = await this.client.get('/api/analytics/dashboard/')
    return response.data
  }

  // Message templates endpoints
  async getMessageTemplates(): Promise<MessageTemplate[]> {
    const base = process.env.NEXT_PUBLIC_CONVERSATIONS_BASE || '/api/communications'
    const response = await this.client.get(`${base}/templates/`)
    return response.data.results || response.data
  }

  async createMessageTemplate(data: Partial<MessageTemplate>): Promise<MessageTemplate> {
    const base = process.env.NEXT_PUBLIC_CONVERSATIONS_BASE || '/api/communications'
    const response = await this.client.post(`${base}/templates/`, data)
    return response.data
  }

  async updateMessageTemplate(id: number, data: Partial<MessageTemplate>): Promise<MessageTemplate> {
    const base = process.env.NEXT_PUBLIC_CONVERSATIONS_BASE || '/api/communications'
    const response = await this.client.patch(`${base}/templates/${id}/`, data)
    return response.data
  }

  async deleteMessageTemplate(id: number): Promise<void> {
    const base = process.env.NEXT_PUBLIC_CONVERSATIONS_BASE || '/api/communications'
    await this.client.delete(`${base}/templates/${id}/`)
  }

  // WhatsApp templates endpoints
  async getWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
    const base = process.env.NEXT_PUBLIC_CONVERSATIONS_BASE || '/api/communications'
    const response = await this.client.get(`${base}/whatsapp-templates/`)
    return response.data.results || response.data
  }

  async syncWhatsAppTemplates(): Promise<{ templates: any }> {
    const base = process.env.NEXT_PUBLIC_CONVERSATIONS_BASE || '/api/communications'
    const response = await this.client.post(`${base}/whatsapp-templates/sync/`)
    return response.data
  }
}

export const apiClient = new ApiClient()
export default apiClient