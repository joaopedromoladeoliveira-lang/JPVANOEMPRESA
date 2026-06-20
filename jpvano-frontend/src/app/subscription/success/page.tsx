'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/contexts/store';
import toast from 'react-hot-toast';
import { usePaymentStatus } from '@/hooks/usePayments';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const { getPaymentStatus } = usePaymentStatus();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const checkPayment = async () => {
      try {
        const userId = searchParams.get('userId');
        const tier = searchParams.get('tier');

        if (!userId || !tier) {
          toast.error('Dados de pagamento inválidos');
          router.push('/');
          return;
        }

        // Show success message
        toast.success(`Assinatura ${tier} ativada com sucesso! 🎉`);
        setStatus('success');

        // Redirect to home after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Erro ao confirmar pagamento');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkPayment();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-bg">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⌛</div>
          <h1 className="text-2xl font-bold mb-2">Confirmando Pagamento...</h1>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            Por favor, aguarde enquanto processamos sua assinatura.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-bg">
      <div className="card p-8 text-center max-w-md">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold mb-2">Parabéns!</h1>
        <p className="text-gray-600 dark:text-dark-text-secondary mb-6">
          Sua assinatura foi ativada com sucesso. Você agora tem acesso a todos
          os recursos premium.
        </p>
        <div className="space-y-2 mb-6 text-left bg-gray-50 dark:bg-dark-bg-secondary p-4 rounded">
          <h3 className="font-semibold mb-3">Benefícios Desbloqueados:</h3>
          <ul className="space-y-2 text-sm">
            <li>✓ Análises detalhadas</li>
            <li>✓ Download de posts</li>
            <li>✓ Sem anúncios</li>
            <li>✓ Histórias ilimitadas</li>
            <li>✓ Temas customizados</li>
          </ul>
        </div>
        <button
          onClick={() => router.push('/')}
          className="btn-primary w-full"
        >
          Voltar para Home
        </button>
      </div>
    </div>
  );
}
