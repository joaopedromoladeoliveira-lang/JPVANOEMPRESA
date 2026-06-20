'use client';

import { ReactNode } from 'react';
import { useEffect } from 'react';
import { useUIStore } from '@/contexts/store';
import '@/styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { darkMode } = useUIStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="JPvano - Rede Social Premium" />
        <title>JPvano - Rede Social Premium</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text">
        {children}
      </body>
    </html>
  );
}
