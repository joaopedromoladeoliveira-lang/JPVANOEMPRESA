import express, { Request, Response, Router } from 'express';
import nexano from '../services/nexano.js';
import supabase from '../services/supabase.js';

const router = Router();

/**
 * Create subscription payment
 * POST /api/payments/subscribe
 */
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { userId, tier, email, name, document } = req.body;

    if (!userId || !tier || !email || !name || !document) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already has active subscription
    const user = await supabase.getUser(userId);

    if (user?.is_premium) {
      return res.status(400).json({ error: 'User already has active subscription' });
    }

    // Create payment intent with Nexano
    const payment = await nexano.createSubscription(userId, tier, email, name, document);

    // Store payment in database
    await supabase.createPayment({
      user_id: userId,
      nexano_payment_id: payment.id,
      amount: tier === 'pro' ? 9.99 : 19.99,
      type: 'subscription',
      tier,
      status: 'pending',
      metadata: { checkout_url: payment.checkout_url },
    });

    return res.status(201).json({
      message: 'Payment intent created',
      payment: {
        id: payment.id,
        checkout_url: payment.checkout_url,
        amount: payment.amount,
        status: payment.status,
      },
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return res.status(500).json({ error: 'Failed to create subscription' });
  }
});

/**
 * Create verification badge payment
 * POST /api/payments/verify
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { userId, email, name, document } = req.body;

    if (!userId || !email || !name || !document) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already verified
    const user = await supabase.getUser(userId);

    if (user?.is_verified) {
      return res.status(400).json({ error: 'User already verified' });
    }

    // Create payment intent with Nexano
    const payment = await nexano.createVerificationPayment(userId, email, name, document);

    // Store payment in database
    await supabase.createPayment({
      user_id: userId,
      nexano_payment_id: payment.id,
      amount: 4.99,
      type: 'verification',
      status: 'pending',
      metadata: { checkout_url: payment.checkout_url },
    });

    return res.status(201).json({
      message: 'Verification payment created',
      payment: {
        id: payment.id,
        checkout_url: payment.checkout_url,
        amount: payment.amount,
        status: payment.status,
      },
    });
  } catch (error) {
    console.error('Error creating verification payment:', error);
    return res.status(500).json({ error: 'Failed to create verification payment' });
  }
});

/**
 * Get payment status
 * GET /api/payments/:paymentId
 */
router.get('/:paymentId', async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;

    const payment = await nexano.getPayment(paymentId);

    return res.json({
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        created_at: payment.created_at,
      },
    });
  } catch (error) {
    console.error('Error retrieving payment:', error);
    return res.status(500).json({ error: 'Failed to retrieve payment' });
  }
});

/**
 * Get user payments
 * GET /api/payments/user/:userId
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { data: payments, error } = await supabase
      .getClient()
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({
      payments: payments || [],
      total: payments?.length || 0,
    });
  } catch (error) {
    console.error('Error retrieving user payments:', error);
    return res.status(500).json({ error: 'Failed to retrieve payments' });
  }
});

export default router;
