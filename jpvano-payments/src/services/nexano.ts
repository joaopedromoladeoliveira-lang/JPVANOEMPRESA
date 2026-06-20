import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

interface NexanoPaymentRequest {
  amount: number;
  currency: string;
  description: string;
  customer: {
    email: string;
    name: string;
    document: string;
  };
  redirect_url: string;
  webhook_url: string;
  metadata?: Record<string, any>;
}

interface NexanoPaymentResponse {
  id: string;
  status: string;
  checkout_url: string;
  amount: number;
  created_at: string;
}

export class NexanoPaymentService {
  private api: AxiosInstance;
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.NEXANO_API_KEY || '';
    this.apiSecret = process.env.NEXANO_API_SECRET || '';
    this.baseUrl = process.env.NEXANO_BASE_URL || 'https://api.nexano.io';

    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(payload: NexanoPaymentRequest): Promise<NexanoPaymentResponse> {
    try {
      const response = await this.api.post('/payments', payload);
      return response.data;
    } catch (error) {
      console.error('Nexano API Error:', error);
      throw new Error('Falha ao criar pagamento');
    }
  }

  /**
   * Create subscription payment
   */
  async createSubscription(
    userId: string,
    tier: 'pro' | 'creator',
    email: string,
    name: string,
    document: string
  ) {
    const amounts: Record<string, number> = {
      pro: 9.99,
      creator: 19.99,
    };

    const amount = amounts[tier] * 100; // Convert to cents

    return this.createPaymentIntent({
      amount,
      currency: 'BRL',
      description: `JPvano ${tier === 'pro' ? 'Premium Pro' : 'Creator Plus'} - Assinatura Mensal`,
      customer: { email, name, document },
      redirect_url: `${process.env.FRONTEND_URL}/subscription/success?userId=${userId}&tier=${tier}`,
      webhook_url: `${process.env.BACKEND_URL}/api/webhooks/nexano`,
      metadata: {
        userId,
        tier,
        type: 'subscription',
      },
    });
  }

  /**
   * Create verification payment (Selo Verificado)
   */
  async createVerificationPayment(
    userId: string,
    email: string,
    name: string,
    document: string
  ) {
    return this.createPaymentIntent({
      amount: 499, // R$4.99
      currency: 'BRL',
      description: 'JPvano - Selo Verificado',
      customer: { email, name, document },
      redirect_url: `${process.env.FRONTEND_URL}/verification/success?userId=${userId}`,
      webhook_url: `${process.env.BACKEND_URL}/api/webhooks/nexano`,
      metadata: {
        userId,
        type: 'verification',
      },
    });
  }

  /**
   * Retrieve payment details
   */
  async getPayment(paymentId: string) {
    try {
      const response = await this.api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error retrieving payment:', error);
      throw error;
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentId: string, amount?: number) {
    try {
      const response = await this.api.post(`/payments/${paymentId}/refund`, {
        amount,
      });
      return response.data;
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha256', this.apiSecret)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }

  /**
   * List payments
   */
  async listPayments(filters?: Record<string, any>) {
    try {
      const response = await this.api.get('/payments', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error listing payments:', error);
      throw error;
    }
  }
}

export default new NexanoPaymentService();
