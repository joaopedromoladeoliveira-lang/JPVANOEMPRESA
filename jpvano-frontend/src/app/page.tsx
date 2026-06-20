'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/contexts/store';

export default function Home() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser && !user) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Carregando...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">
          Bem-vindo ao JPvano!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-6">
            <div className="text-4xl mb-4">📸</div>
            <h2 className="text-xl font-bold mb-2">Compartilhe Fotos</h2>
            <p className="text-gray-600 dark:text-dark-text-secondary">
              Compartilhe seus melhores momentos com a comunidade JPvano
            </p>
          </div>

          <div className="card p-6">
            <div className="text-4xl mb-4">💬</div>
            <h2 className="text-xl font-bold mb-2">Conecte-se</h2>
            <p className="text-gray-600 dark:text-dark-text-secondary">
              Mensagens privadas, comentários e muito mais
            </p>
          </div>

          <div className="card p-6">
            <div className="text-4xl mb-4">🌟</div>
            <h2 className="text-xl font-bold mb-2">Recursos Premium</h2>
            <p className="text-gray-600 dark:text-dark-text-secondary">
              Acesse recursos exclusivos da plataforma
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
