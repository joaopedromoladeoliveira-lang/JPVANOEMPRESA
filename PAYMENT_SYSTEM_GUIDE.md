# 💳 JPvano - Sistema de Pagamentos (Nexano + Supabase)

## 🎯 O Que Foi Criado

### 1. **Serviço de Pagamentos** (`jpvano-payments`)
Servidor Node.js dedicado para processar pagamentos com Nexano

- ✅ Integração completa com Nexano
- ✅ Processamento de webhooks
- ✅ Atualização automática de perfis
- ✅ API para admin
- ✅ Logs de auditoria

### 2. **Frontend Components** (`jpvano-frontend`)
Componentes React para pagamentos

- ✅ Modal de Assinatura
- ✅ Modal de Verificação
- ✅ Páginas de Sucesso
- ✅ Hooks customizados
- ✅ Integração Supabase

### 3. **Banco de Dados** (Supabase)
Estrutura de dados completa

- ✅ Tabelas de perfil
- ✅ Histórico de pagamentos
- ✅ Logs administrativos
- ✅ Dados de posts e comentários
- ✅ Sistema de followers

---

## 💰 Fluxos de Pagamento

### Fluxo 1: Assinatura Premium

```
1. Usuário clica "Assinar"
   ↓
2. Modal de Assinatura abre
   ↓
3. Seleciona plano (Pro/Creator)
   ↓
4. Preenche CPF
   ↓
5. POST /api/payments/subscribe
   └─→ Nexano cria payment intent
   └─→ Retorna checkout_url
   ↓
6. Redireciona para Nexano
   ↓
7. Usuário completa pagamento
   ↓
8. Nexano envia webhook
   ↓
9. Servidor valida assinatura
   ↓
10. Atualiza Supabase:
    - is_premium = true
    - premium_tier = 'pro' ou 'creator'
    ↓
11. Redireciona para success page
    ↓
12. Usuário vê benefícios desbloqueados ✅
```

### Fluxo 2: Selo Verificado

```
1. Usuário clica "Verificar Conta"
   ↓
2. Modal de Verificação abre
   ↓
3. Seleciona tipo (CPF/CNPJ)
   ↓
4. Preenche documento
   ↓
5. POST /api/payments/verify
   └─→ Nexano cria payment intent
   └─→ Retorna checkout_url (R$ 4,99)
   ↓
6. Usuário completa pagamento
   ↓
7. Webhook recebido
   ↓
8. Atualiza Supabase:
    - is_verified = true
    - verified_at = now()
    ↓
9. Badge de verificação ativado ✅
```

---

## 🔌 API Endpoints

### Pagamentos

#### 1. Criar Assinatura
```http
POST /api/payments/subscribe
Content-Type: application/json

{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "tier": "pro",
  "email": "usuario@email.com",
  "name": "João Silva",
  "document": "12345678900"
}

Response 201:
{
  "message": "Payment intent created",
  "payment": {
    "id": "pay_xxxxx",
    "checkout_url": "https://checkout.nexano.io/...",
    "amount": 999,
    "status": "pending"
  }
}
```

#### 2. Criar Verificação
```http
POST /api/payments/verify
Content-Type: application/json

{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@email.com",
  "name": "João Silva",
  "document": "12345678900"
}

Response 201:
{
  "message": "Verification payment created",
  "payment": {
    "id": "pay_xxxxx",
    "checkout_url": "https://checkout.nexano.io/...",
    "amount": 499,
    "status": "pending"
  }
}
```

#### 3. Status do Pagamento
```http
GET /api/payments/pay_xxxxx

Response 200:
{
  "payment": {
    "id": "pay_xxxxx",
    "status": "completed",
    "amount": 999,
    "created_at": "2026-06-19T10:30:00Z"
  }
}
```

#### 4. Pagamentos do Usuário
```http
GET /api/payments/user/550e8400-e29b-41d4-a716-446655440000

Response 200:
{
  "payments": [
    {
      "id": "pay_xxxxx",
      "type": "subscription",
      "status": "completed",
      "amount": 999,
      "created_at": "2026-06-19T10:30:00Z"
    }
  ],
  "total": 1
}
```

### Admin

#### 1. Dashboard de Receitas
```http
GET /api/admin/revenue?startDate=2026-01-01&endDate=2026-12-31

Response 200:
{
  "revenue": {
    "totalRevenue": 15000.50,
    "totalPayments": 150,
    "byType": {
      "subscriptions": 100,
      "verifications": 45,
      "features": 5
    }
  },
  "subscriptions": {
    "total": 100,
    "pro": 60,
    "creator": 40
  }
}
```

#### 2. Listar Pagamentos
```http
GET /api/admin/payments?status=completed&type=subscription&limit=50&offset=0

Response 200:
{
  "payments": [...],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

#### 3. Banir Usuário
```http
POST /api/admin/users/550e8400-e29b-41d4-a716-446655440000/ban
Content-Type: application/json

{
  "reason": "Violação de termos de serviço"
}

Response 200:
{
  "message": "User banned successfully",
  "user": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "banned",
    "ban_reason": "Violação de termos de serviço"
  }
}
```

#### 4. Conceder Verificação
```http
POST /api/admin/users/550e8400-e29b-41d4-a716-446655440000/verify

Response 200:
{
  "message": "Verification badge granted",
  "user": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "is_verified": true,
    "verified_at": "2026-06-19T10:30:00Z"
  }
}
```

#### 5. Logs do Admin
```http
GET /api/admin/logs?limit=50&offset=0

Response 200:
{
  "logs": [
    {
      "id": "log_xxxxx",
      "admin_id": "550e8400-e29b-41d4-a716-446655440000",
      "action": "subscription_activated",
      "metadata": {
        "userId": "...",
        "tier": "pro",
        "amount": 999
      },
      "created_at": "2026-06-19T10:30:00Z"
    }
  ],
  "total": 150
}
```

---

## 🎨 Componentes Frontend

### SubscriptionModal
```tsx
import { SubscriptionModal } from '@/components/SubscriptionModal';

export default function Page() {
  const [showSubscription, setShowSubscription] = useState(false);

  return (
    <>
      <button onClick={() => setShowSubscription(true)}>
        Assinar Premium
      </button>
      
      {showSubscription && (
        <SubscriptionModal onClose={() => setShowSubscription(false)} />
      )}
    </>
  );
}
```

### VerificationModal
```tsx
import { VerificationModal } from '@/components/VerificationModal';

export default function Page() {
  const [showVerification, setShowVerification] = useState(false);

  return (
    <>
      <button onClick={() => setShowVerification(true)}>
        Obter Selo Verificado
      </button>
      
      {showVerification && (
        <VerificationModal onClose={() => setShowVerification(false)} />
      )}
    </>
  );
}
```

### Hooks de Pagamento
```tsx
import { useSubscription, useVerification } from '@/hooks/usePayments';

export default function Page() {
  const { subscribe, isLoading, error } = useSubscription();
  const { requestVerification } = useVerification();

  const handleSubscribe = async () => {
    await subscribe('pro', '12345678900');
  };

  const handleVerify = async () => {
    await requestVerification('12345678900');
  };

  return (
    <>
      <button onClick={handleSubscribe} disabled={isLoading}>
        Assinar
      </button>
      <button onClick={handleVerify}>
        Verificar
      </button>
      {error && <p className="error">{error}</p>}
    </>
  );
}
```

---

## 🧪 Testes

### 1. Testar Webhook Localmente

```bash
# Instalar ngrok
npm install -g ngrok

# Rodar em outro terminal
ngrok http 5001
# Copia URL: https://xxxx-xx-xxx-xxx.ngrok.io

# Configurar em Nexano Dashboard:
# Webhook URL: https://xxxx-xx-xxx-xxx.ngrok.io/api/webhooks/nexano

# Depois pode testar enviando webhook manualmente do dashboard
```

### 2. Testar Assinatura

```bash
# 1. Iniciar payments service
cd jpvano-payments
npm run dev

# 2. Iniciar frontend
cd jpvano-frontend
npm run dev

# 3. No navegador
# http://localhost:3000
# Clica em "Assinar"
# Preenche dados
# Clica em "Continuar"
# Será redirecionado para Nexano

# 4. Aceita pagamento no checkout (teste)
# Redireciona para success page
```

### 3. Verificar Database

```bash
# Supabase Dashboard → Table Editor
# Abrir tabela "payments"
# Verificar se novo pagamento foi inserido com status "completed"

# Depois abrir tabela "profiles"
# Verificar se is_premium foi atualizado para true
```

---

## 📊 Dados de Teste

### CPF Válido para Testes
```
12345678900
```

### Documento Teste (CNPJ)
```
00000000000191
```

---

## 🔐 Credenciais Configuradas

### Nexano
```
✅ API Key:    jpvanoempresa_20o9cjnqxzyrsn6i
✅ API Secret: awlooouq2xgpb59mnjkvmll98peupc1enfetj1251takzmyrdby6tlsnpln8d1v0
```

### Supabase
```
⏳ Configure em .env após criar projeto:
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_ANON_KEY=sua_chave
```

---

## 🚀 Próximas Implementações

### 1. Dashboard Admin
- [ ] Interface web para admin
- [ ] Gráficos de receita
- [ ] Gestão de usuários
- [ ] Análise de pagamentos

### 2. Email de Confirmação
- [ ] Email após pagamento bem-sucedido
- [ ] Email de falha de pagamento
- [ ] Recibo de pagamento

### 3. Cancelamento de Assinatura
- [ ] Endpoint para cancelar
- [ ] Webhook de cancelamento
- [ ] Atualizar banco de dados

### 4. Recurso de Reembolso
- [ ] Admin pode reembolsar
- [ ] Validação de período
- [ ] Log de reembolsos

### 5. Monetização Avançada
- [ ] Venda de produtos digitais
- [ ] Doações
- [ ] Retirada de ganhos
- [ ] Dashboard de analytics do creator

---

## 🆘 Troubleshooting

### Erro: "Payment service not running"
```bash
cd jpvano-payments
npm run dev
```

### Erro: "Supabase connection failed"
```
Verificar em .env:
- SUPABASE_URL está correto?
- SUPABASE_ANON_KEY está correto?
```

### Webhook não recebe webhook
```
1. Verificar URL em Nexano Dashboard
2. Testar com ngrok localmente
3. Verificar logs: npm run dev 2>&1 | grep webhook
```

### Pagamento fica "pending"
```
1. Webhook pode não ter sido recebido
2. Verificar em Supabase → tabela "payments"
3. Status deve estar como "completed"
4. Verificar logs do servidor
```

---

## 📈 Monitorar em Produção

### Supabase Monitoring
```
Supabase Dashboard → Logs
```

### Nexano Dashboard
```
https://dashboard.nexano.io
→ Transactions
→ Veja todas as transações
```

### Logs da Aplicação
```bash
# Via Railway/Render
Ver logs do deployment

# Via SSH
tail -f /var/log/jpvano-payments.log
```

---

**Sistema Completo de Pagamentos Implementado** ✅

Credenciais Nexano configuradas e prontas para usar!
