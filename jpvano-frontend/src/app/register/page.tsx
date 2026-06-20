'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useAuthStore } from '@/contexts/store';
import toast from 'react-hot-toast';

interface RegisterForm {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterForm>({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
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
      const response = await api.post('/auth/register', formData);
      const { user, accessToken, refreshToken } = response.data;

      setAuth(user, accessToken, refreshToken);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Conta criada com sucesso! Verifique seu e-mail.');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Erro ao registrar');
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
            Crie sua conta agora
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="Primeiro Nome"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="input-field"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Último Nome"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

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
            type="text"
            name="username"
            placeholder="Nome de usuário"
            value={formData.username}
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
            {isLoading ? 'Registrando...' : 'Registrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 dark:text-dark-text-secondary">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-primary-600 hover:underline font-medium">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
