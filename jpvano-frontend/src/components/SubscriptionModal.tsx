'use client';

import { useState } from 'react';
import { useSubscription } from '@/hooks/usePayments';
import toast from 'react-hot-toast';
import { Check } from 'react-icons/fa';

export const SubscriptionModal = ({ onClose }: { onClose: () => void }) => {
  const { subscribe, isLoading } = useSubscription();
  const [selectedTier, setSelectedTier] = useState<'pro' | 'creator' | null>(null);
  const [document, setDocument] = useState('');

  const tiers = [
    {
      id: 'pro',
      name: 'Premium Pro',
      price: 'R$ 9,99',
      period: '/mês',
      description: 'Para criadores ocasionais',
      features: [
        'Análises detalhadas',
        'Download de posts',
        'Sem anúncios',
        'Até 5 histórias por dia',
        'Temas customizados',
      ],
      popular: false,
    },
    {
      id: 'creator',
      name: 'Creator Plus',
      price: 'R$ 19,99',
      period: '/mês',
      description: 'Para criadores profissionais',
      features: [
        'Tudo do Pro',
        'Monetização de posts',
        'Venda de produtos digitais',
        'Histórias ilimitadas',
        'Suporte prioritário',
        'Badges customizadas',
        'Retirada de ganhos',
      ],
      popular: true,
    },
  ];

  const handleSubscribe = async () => {
    if (!selectedTier || !document) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    // Validate document format (CPF)
    if (document.replace(/\D/g, '').length !== 11) {
      toast.error('CPF deve ter 11 dígitos');
      return;
    }

    const result = await subscribe(selectedTier, document);
    if (!result) {
      toast.error('Erro ao processar assinatura');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-dark-border p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Escolha seu Plano</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier.id as 'pro' | 'creator')}
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  selectedTier === tier.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-dark-border hover:border-primary-300'
                } ${tier.popular ? 'relative md:transform md:scale-105' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                      MAIS POPULAR
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-gray-600 dark:text-dark-text-secondary mb-4">
                  {tier.description}
                </p>

                <div className="mb-6">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-gray-600 dark:text-dark-text-secondary">
                    {tier.period}
                  </span>
                </div>

                <ul className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-dark-text">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Document Input */}
          {selectedTier && (
            <div className="bg-gray-50 dark:bg-dark-bg-tertiary p-6 rounded-lg mb-6">
              <label className="block text-sm font-medium mb-2">
                CPF para Pagamento *
              </label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={document}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  const formatted = value
                    .replace(/(\d{3})(\d)/, '$1.$2')
                    .replace(/(\d{3})(\d)/, '$1.$2')
                    .replace(/(\d{3})(\d{2})$/, '$1-$2');
                  setDocument(formatted);
                }}
                className="input-field"
              />
              <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-2">
                Seu CPF é obrigatório para processar o pagamento com segurança.
              </p>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleSubscribe}
            disabled={!selectedTier || !document || isLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-lg py-3"
          >
            {isLoading ? (
              <>
                <span className="animate-spin inline-block mr-2">⌛</span>
                Processando...
              </>
            ) : (
              `Continuar com ${tiers.find((t) => t.id === selectedTier)?.name || 'Plano'}`
            )}
          </button>

          {/* Footer Info */}
          <p className="text-center text-xs text-gray-500 dark:text-dark-text-secondary mt-4">
            Você será redirecionado para a página de pagamento segura da Nexano.
            Seu pagamento é 100% seguro e criptografado.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
