import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/contexts/store';

const PAYMENTS_API = process.env.NEXT_PUBLIC_PAYMENTS_API || 'http://localhost:5001/api';

export const useSubscription = () => {
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = useCallback(
    async (tier: 'pro' | 'creator', document: string) => {
      if (!user) {
        setError('Usuário não autenticado');
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.post(`${PAYMENTS_API}/payments/subscribe`, {
          userId: user.id,
          tier,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          document,
        });

        // Redirect to Nexano checkout
        if (response.data.payment?.checkout_url) {
          window.location.href = response.data.payment.checkout_url;
          return response.data;
        }

        setError('Falha ao criar sessão de pagamento');
        return null;
      } catch (err: any) {
        const message = err.response?.data?.error || 'Erro ao processar assinatura';
        setError(message);
        console.error('Subscription error:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  return { subscribe, isLoading, error };
};

export const useVerification = () => {
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestVerification = useCallback(
    async (document: string) => {
      if (!user) {
        setError('Usuário não autenticado');
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.post(`${PAYMENTS_API}/payments/verify`, {
          userId: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          document,
        });

        // Redirect to Nexano checkout
        if (response.data.payment?.checkout_url) {
          window.location.href = response.data.payment.checkout_url;
          return response.data;
        }

        setError('Falha ao criar sessão de pagamento');
        return null;
      } catch (err: any) {
        const message = err.response?.data?.error || 'Erro ao processar verificação';
        setError(message);
        console.error('Verification error:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  return { requestVerification, isLoading, error };
};

export const usePaymentStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPaymentStatus = useCallback(async (paymentId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${PAYMENTS_API}/payments/${paymentId}`);
      return response.data.payment;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao buscar status do pagamento';
      setError(message);
      console.error('Payment status error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { getPaymentStatus, isLoading, error };
};

export const useUserPayments = (userId?: string) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${PAYMENTS_API}/payments/user/${id}`);
      setPayments(response.data.payments || []);
      return response.data.payments;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao buscar pagamentos';
      setError(message);
      console.error('Fetch payments error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { payments, fetchPayments, isLoading, error };
};
