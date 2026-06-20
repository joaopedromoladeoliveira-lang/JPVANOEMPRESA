'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useAuthStore } from '@/contexts/store';
import toast from 'react-hot-toast';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      const { user, accessToken, refreshToken, requiresTwoFactor } = response.data;

      if (requiresTwoFactor) {
        localStorage.setItem('userId', user.id);
        router.push('/verify-2fa');
        return;
      }

      setAuth(user, accessToken, refreshToken);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Login realizado com sucesso!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-bg">
      <div className="w-full max-w-md p-8 card">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center text-primary-600 mb-2">
            JPvano
          </h1>
          <p className="text-center text-gray-600 dark:text-dark-text-secondary">
            Bem-vindo de volta!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={handleChange}
            required
            className="input-field"
          />

          <input
            type="password"
            name="password"
            placeholder="Senha"
            value={formData.password}
            onChange={handleChange}
            required
            className="input-field"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <Link
            href="/forgot-password"
            className="block text-center text-primary-600 hover:underline text-sm"
          >
            Esqueceu a senha?
          </Link>

          <p className="text-center text-gray-600 dark:text-dark-text-secondary">
            Não tem uma conta?{' '}
            <Link href="/register" className="text-primary-600 hover:underline font-medium">
              Registre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
