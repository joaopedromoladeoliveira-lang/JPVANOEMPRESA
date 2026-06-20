import express, { Request, Response, Router } from 'express';
import nexano from '../services/nexano.js';
import supabase from '../services/supabase.js';

const router = Router();

interface NexanoWebhookPayload {
  id: string;
  status: string;
  amount: number;
  metadata?: {
    userId?: string;
    tier?: string;
    type?: string;
  };
}

/**
 * Verify webhook signature middleware
 */
const verifyWebhookSignature = (req: Request, res: Response, next: Function) => {
  const signature = req.headers['x-nexano-signature'] as string;
  const rawBody = JSON.stringify(req.body);

  if (!nexano.verifyWebhookSignature(rawBody, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
};

/**
 * Handle Nexano payment webhook
 */
router.post(
  '/webhooks/nexano',
  verifyWebhookSignature,
  async (req: Request, res: Response) => {
    try {
      const payload: NexanoWebhookPayload = req.body;

      console.log('📦 Webhook recebido:', {
        paymentId: payload.id,
        status: payload.status,
        amount: payload.amount,
        metadata: payload.metadata,
      });

      // Find payment in database
      const { data: payments, error: findError } = await supabase
        .getClient()
        .from('payments')
        .select('*')
        .eq('nexano_payment_id', payload.id)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        throw findError;
      }

      if (!payments) {
        console.error('Pagamento não encontrado:', payload.id);
        return res.status(404).json({ error: 'Payment not found' });
      }

      // Update payment status
      await supabase.updatePaymentStatus(payments.id, payload.status);

      // Handle different payment statuses
      if (payload.status === 'completed') {
        const userId = payload.metadata?.userId;
        const type = payload.metadata?.type;
        const tier = payload.metadata?.tier;

        if (!userId) {
          console.error('User ID not found in metadata');
          return res.status(400).json({ error: 'User ID not found' });
        }

        // Process based on payment type
        if (type === 'subscription') {
          // Update user premium status
          await supabase.updateUserPremium(userId, tier as 'pro' | 'creator');

          // Log admin action
          await supabase.createAdminLog('system', 'subscription_activated', {
            userId,
            tier,
            amount: payload.amount,
          });

          console.log(`✅ Assinatura ativada para ${userId} - Tier: ${tier}`);
        } else if (type === 'verification') {
          // Update verification badge
          await supabase.updateUserVerification(userId, true);

          // Log admin action
          await supabase.createAdminLog('system', 'verification_approved', {
            userId,
            amount: payload.amount,
          });

          console.log(`✅ Verificação aprovada para ${userId}`);
        }

        return res.status(200).json({ success: true, message: 'Payment processed' });
      } else if (payload.status === 'failed') {
        console.warn(`❌ Pagamento falhou: ${payload.id}`);

        // Optionally notify user
        return res.status(200).json({ success: true, message: 'Payment failure recorded' });
      } else if (payload.status === 'pending') {
        console.log(`⏳ Pagamento pendente: ${payload.id}`);
        return res.status(200).json({ success: true, message: 'Payment pending' });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'jpvano-payments',
  });
});

export default router;
