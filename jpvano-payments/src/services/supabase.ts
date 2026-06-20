import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL || '';
    const key = process.env.SUPABASE_ANON_KEY || '';

    if (!url || !key) {
      throw new Error('SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórios');
    }

    this.client = createClient(url, key);
  }

  /**
   * Get Supabase client
   */
  getClient() {
    return this.client;
  }

  /**
   * Create payment record
   */
  async createPayment(payment: {
    user_id: string;
    nexano_payment_id: string;
    amount: number;
    type: 'subscription' | 'verification' | 'premium_features';
    tier?: string;
    status: string;
    metadata?: Record<string, any>;
  }) {
    const { data, error } = await this.client
      .from('payments')
      .insert([
        {
          user_id: payment.user_id,
          nexano_payment_id: payment.nexano_payment_id,
          amount: payment.amount,
          type: payment.type,
          tier: payment.tier,
          status: payment.status,
          metadata: payment.metadata,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return data?.[0];
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(paymentId: string, status: string) {
    const { data, error } = await this.client
      .from('payments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', paymentId)
      .select();

    if (error) throw error;
    return data?.[0];
  }

  /**
   * Update user premium status
   */
  async updateUserPremium(userId: string, tier: 'pro' | 'creator' | null) {
    const { data, error } = await this.client
      .from('profiles')
      .update({
        premium_tier: tier,
        is_premium: !!tier,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select();

    if (error) throw error;
    return data?.[0];
  }

  /**
   * Update user verification badge
   */
  async updateUserVerification(userId: string, isVerified: boolean) {
    const { data, error } = await this.client
      .from('profiles')
      .update({
        is_verified: isVerified,
        verified_at: isVerified ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select();

    if (error) throw error;
    return data?.[0];
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string) {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Get revenue stats
   */
  async getRevenueStats(filters?: { startDate?: string; endDate?: string }) {
    let query = this.client
      .from('payments')
      .select('amount, type, status, created_at')
      .eq('status', 'completed');

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      totalRevenue: data?.reduce((sum, p) => sum + p.amount, 0) || 0,
      totalPayments: data?.length || 0,
      byType: {
        subscriptions: data?.filter((p) => p.type === 'subscription').length || 0,
        verifications: data?.filter((p) => p.type === 'verification').length || 0,
        features: data?.filter((p) => p.type === 'premium_features').length || 0,
      },
    };
  }

  /**
   * Get active subscriptions count
   */
  async getActiveSubscriptions() {
    const { data, error } = await this.client
      .from('profiles')
      .select('premium_tier')
      .eq('is_premium', true);

    if (error) throw error;

    return {
      total: data?.length || 0,
      pro: data?.filter((p) => p.premium_tier === 'pro').length || 0,
      creator: data?.filter((p) => p.premium_tier === 'creator').length || 0,
    };
  }

  /**
   * Ban user
   */
  async banUser(userId: string, reason: string) {
    const { data, error } = await this.client
      .from('profiles')
      .update({
        status: 'banned',
        ban_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select();

    if (error) throw error;
    return data?.[0];
  }

  /**
   * Suspend user
   */
  async suspendUser(userId: string, reason: string, days: number = 7) {
    const suspendedUntil = new Date();
    suspendedUntil.setDate(suspendedUntil.getDate() + days);

    const { data, error } = await this.client
      .from('profiles')
      .update({
        status: 'suspended',
        suspended_reason: reason,
        suspended_until: suspendedUntil.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select();

    if (error) throw error;
    return data?.[0];
  }

  /**
   * Create admin log entry
   */
  async createAdminLog(adminId: string, action: string, metadata?: Record<string, any>) {
    const { error } = await this.client.from('admin_logs').insert([
      {
        admin_id: adminId,
        action,
        metadata,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;
  }
}

export default new SupabaseService();
