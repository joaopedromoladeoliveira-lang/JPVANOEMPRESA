'use client';

import { useState } from 'react';
import { useVerification } from '@/hooks/usePayments';
import toast from 'react-hot-toast';

export const VerificationModal = ({ onClose }: { onClose: () => void }) => {
  const { requestVerification, isLoading } = useVerification();
  const [document, setDocument] = useState('');
  const [documentType, setDocumentType] = useState<'cpf' | 'cnpj'>('cpf');

  const handleVerify = async () => {
    if (!document) {
      toast.error('Por favor, preencha o documento');
      return;
    }

    const cleanDocument = document.replace(/\D/g, '');

    if (documentType === 'cpf' && cleanDocument.length !== 11) {
      toast.error('CPF deve ter 11 dígitos');
      return;
    }

    if (documentType === 'cnpj' && cleanDocument.length !== 14) {
      toast.error('CNPJ deve ter 14 dígitos');
      return;
    }

    const result = await requestVerification(cleanDocument);
    if (!result) {
      toast.error('Erro ao processar verificação');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-dark-border p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Obter Selo Verificado</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              ✓ Obtenha um selo de verificação oficial
              <br />✓ Aumenta sua credibilidade
              <br />✓ Proteja sua identidade
              <br />✓ <strong>R$ 4,99</strong> uma única vez
            </p>
          </div>

          {/* Document Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Documento</label>
            <select
              value={documentType}
              onChange={(e) => {
                setDocumentType(e.target.value as 'cpf' | 'cnpj');
                setDocument('');
              }}
              className="input-field"
            >
              <option value="cpf">CPF (Pessoa Física)</option>
              <option value="cnpj">CNPJ (Pessoa Jurídica)</option>
            </select>
          </div>

          {/* Document Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {documentType === 'cpf' ? 'CPF' : 'CNPJ'} *
            </label>
            <input
              type="text"
              placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
              value={document}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                let formatted = '';

                if (documentType === 'cpf') {
                  formatted = value
                    .replace(/(\d{3})(\d)/, '$1.$2')
                    .replace(/(\d{3})(\d)/, '$1.$2')
                    .replace(/(\d{3})(\d{2})$/, '$1-$2');
                } else {
                  formatted = value
                    .replace(/(\d{2})(\d)/, '$1.$2')
                    .replace(/(\d{3})(\d)/, '$1.$2')
                    .replace(/(\d{4})(\d)/, '$1/$2')
                    .replace(/(\d{2})(\d{2})$/, '$1-$2');
                }

                setDocument(formatted);
              }}
              className="input-field"
            />
          </div>

          {/* Benefits */}
          <div>
            <h3 className="font-semibold mb-3">Benefícios do Selo:</h3>
            <ul className="space-y-2 text-sm">
              <li>✓ Badge de verificado no seu perfil</li>
              <li>✓ Maior confiança dos seguidores</li>
              <li>✓ Destaque em buscas</li>
              <li>✓ Proteção de conta verificada</li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            onClick={handleVerify}
            disabled={!document || isLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-3"
          >
            {isLoading ? (
              <>
                <span className="animate-spin inline-block mr-2">⌛</span>
                Processando...
              </>
            ) : (
              'Continuar (R$ 4,99)'
            )}
          </button>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 dark:text-dark-text-secondary">
            Pagamento seguro processado por Nexano.
            <br />
            Seu documento é verificado com segurança.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
