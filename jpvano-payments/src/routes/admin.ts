import express, { Request, Response, Router } from 'express';
import supabase from '../services/supabase.js';

const router = Router();

/**
 * Get revenue dashboard
 * GET /api/admin/revenue
 */
router.get('/revenue', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await supabase.getRevenueStats({
      startDate: startDate as string,
      endDate: endDate as string,
    });

    const subscriptions = await supabase.getActiveSubscriptions();

    return res.json({
      revenue: stats,
      subscriptions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting revenue stats:', error);
    return res.status(500).json({ error: 'Failed to retrieve revenue stats' });
  }
});

/**
 * Get all payments
 * GET /api/admin/payments
 */
router.get('/payments', async (req: Request, res: Response) => {
  try {
    const { status, type, limit = 50, offset = 0 } = req.query;

    let query = supabase.getClient().from('payments').select('*');

    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (error) throw error;

    return res.json({
      payments: data || [],
      total: count || 0,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error('Error retrieving payments:', error);
    return res.status(500).json({ error: 'Failed to retrieve payments' });
  }
});

/**
 * Ban user
 * POST /api/admin/users/:userId/ban
 */
router.post('/users/:userId/ban', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Ban reason is required' });
    }

    const user = await supabase.banUser(userId, reason);

    // Log action
    await supabase.createAdminLog('admin', 'user_banned', {
      userId,
      reason,
    });

    return res.json({
      message: 'User banned successfully',
      user,
    });
  } catch (error) {
    console.error('Error banning user:', error);
    return res.status(500).json({ error: 'Failed to ban user' });
  }
});

/**
 * Suspend user
 * POST /api/admin/users/:userId/suspend
 */
router.post('/users/:userId/suspend', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { reason, days = 7 } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Suspend reason is required' });
    }

    const user = await supabase.suspendUser(userId, reason, days);

    // Log action
    await supabase.createAdminLog('admin', 'user_suspended', {
      userId,
      reason,
      days,
    });

    return res.json({
      message: 'User suspended successfully',
      user,
    });
  } catch (error) {
    console.error('Error suspending user:', error);
    return res.status(500).json({ error: 'Failed to suspend user' });
  }
});

/**
 * Grant verification badge
 * POST /api/admin/users/:userId/verify
 */
router.post('/users/:userId/verify', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await supabase.updateUserVerification(userId, true);

    // Log action
    await supabase.createAdminLog('admin', 'verification_granted', {
      userId,
    });

    return res.json({
      message: 'Verification badge granted',
      user,
    });
  } catch (error) {
    console.error('Error granting verification:', error);
    return res.status(500).json({ error: 'Failed to grant verification' });
  }
});

/**
 * Revoke verification badge
 * POST /api/admin/users/:userId/unverify
 */
router.post('/users/:userId/unverify', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await supabase.updateUserVerification(userId, false);

    // Log action
    await supabase.createAdminLog('admin', 'verification_revoked', {
      userId,
    });

    return res.json({
      message: 'Verification badge revoked',
      user,
    });
  } catch (error) {
    console.error('Error revoking verification:', error);
    return res.status(500).json({ error: 'Failed to revoke verification' });
  }
});

/**
 * Get admin logs
 * GET /api/admin/logs
 */
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const { data, error, count } = await supabase
      .getClient()
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    if (error) throw error;

    return res.json({
      logs: data || [],
      total: count || 0,
    });
  } catch (error) {
    console.error('Error retrieving logs:', error);
    return res.status(500).json({ error: 'Failed to retrieve logs' });
  }
});

export default router;
