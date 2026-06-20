'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function VerificationSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processVerification = async () => {
      try {
        const userId = searchParams.get('userId');

        if (!userId) {
          toast.error('Dados de verificação inválidos');
          router.push('/');
          return;
        }

        // Show success message
        toast.success('Parabéns! Seu selo verificado foi ativado! 🎉');

        // Redirect to profile after 3 seconds
        setTimeout(() => {
          router.push('/profile');
        }, 3000);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Erro ao confirmar verificação');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    processVerification();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-bg">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⌛</div>
          <h1 className="text-2xl font-bold mb-2">Confirmando Verificação...</h1>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            Aguarde enquanto processamos seu selo verificado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-bg">
      <div className="card p-8 text-center max-w-md">
        <div className="text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold mb-2">Verificado!</h1>
        <p className="text-gray-600 dark:text-dark-text-secondary mb-6">
          Seu selo de verificação foi ativado. Agora você tem o badge oficial
          de usuário verificado no JPvano.
        </p>
        <div className="space-y-2 mb-6 text-left bg-gray-50 dark:bg-dark-bg-secondary p-4 rounded">
          <h3 className="font-semibold mb-3">O que você ganha:</h3>
          <ul className="space-y-2 text-sm">
            <li>✓ Badge de verificação no perfil</li>
            <li>✓ Maior credibilidade</li>
            <li>✓ Destaque em buscas</li>
            <li>✓ Proteção de conta verificada</li>
          </ul>
        </div>
        <button
          onClick={() => router.push('/profile')}
          className="btn-primary w-full"
        >
          Ver Meu Perfil
        </button>
      </div>
    </div>
  );
}
