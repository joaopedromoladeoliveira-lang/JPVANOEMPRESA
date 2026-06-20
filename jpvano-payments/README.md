# JPvano Payments Service

Serviço de pagamentos integrado com **Nexano** e **Supabase**.

## 🎯 Funcionalidades

- ✅ Assinatura Premium (Pro/Creator)
- ✅ Pagamento de Selo Verificado
- ✅ Webhooks Nexano
- ✅ Gestão de Receitas
- ✅ Admin Dashboard
- ✅ Logs de Auditoria

## 🔧 Configuração

### .env

```env
# Nexano
NEXANO_API_KEY=seu_api_key
NEXANO_API_SECRET=seu_api_secret
NEXANO_BASE_URL=https://api.nexano.io

# Supabase
SUPABASE_URL=sua_url_supabase
SUPABASE_ANON_KEY=sua_chave_anonima

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5001

# Server
PAYMENTS_PORT=5001
NODE_ENV=development
```

## 📦 Instalação

```bash
npm install
```

## 🚀 Desenvolvimento

```bash
npm run dev
```

## 🔌 API Endpoints

### Pagamentos

#### Criar Assinatura
```
POST /api/payments/subscribe

{
  "userId": "uuid",
  "tier": "pro" | "creator",
  "email": "user@example.com",
  "name": "Nome do Usuário",
  "document": "12345678900"
}
```

#### Criar Pagamento de Verificação
```
POST /api/payments/verify

{
  "userId": "uuid",
  "email": "user@example.com",
  "name": "Nome do Usuário",
  "document": "12345678900"
}
```

#### Status do Pagamento
```
GET /api/payments/:paymentId
```

#### Pagamentos do Usuário
```
GET /api/payments/user/:userId
```

### Admin

#### Dashboard de Receitas
```
GET /api/admin/revenue?startDate=2024-01-01&endDate=2024-12-31
```

#### Listar Pagamentos
```
GET /api/admin/payments?status=completed&type=subscription&limit=50&offset=0
```

#### Banir Usuário
```
POST /api/admin/users/:userId/ban

{
  "reason": "Violação de termos"
}
```

#### Suspender Usuário
```
POST /api/admin/users/:userId/suspend

{
  "reason": "Comportamento suspeito",
  "days": 7
}
```

#### Conceder Verificação
```
POST /api/admin/users/:userId/verify
```

#### Revogar Verificação
```
POST /api/admin/users/:userId/unverify
```

#### Logs do Admin
```
GET /api/admin/logs?limit=50&offset=0
```

## 🔐 Segurança

- Verificação de assinatura de webhooks
- CORS configurado
- Variáveis de ambiente protegidas

## 📊 Schema Supabase

Tabelas necessárias:

```sql
-- Users/Profiles
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  document VARCHAR(20),
  is_premium BOOLEAN DEFAULT false,
  premium_tier VARCHAR(50),
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active',
  ban_reason TEXT,
  suspended_reason TEXT,
  suspended_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(user_id),
  nexano_payment_id VARCHAR(255) UNIQUE,
  amount DECIMAL(10, 2),
  type VARCHAR(50),
  tier VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Logs
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY,
  admin_id UUID REFERENCES profiles(user_id),
  action VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 Fluxo de Pagamento

1. **Usuário inicia pagamento**
   - Frontend chama `/api/payments/subscribe`

2. **Sistema cria intent**
   - Nexano retorna checkout_url
   - Pagamento salvo como "pending"

3. **Usuário completa pagamento**
   - Nexano processa no seu site

4. **Webhook é acionado**
   - Sistema verifica assinatura
   - Status é atualizado
   - Benefícios são liberados (Premium/Verificação)

5. **Admin recebe notificação**
   - Log é criado
   - Dashboard atualizado

## 📈 Métricas

- Total de receita
- Receita por tipo (subscription, verificação)
- Assinaturas ativas (Pro, Creator)
- Logs de auditoria

## 🛠️ Desenvolvimento

### Testar Webhook Localmente

```bash
npm run webhook:test
```

### Build para Produção

```bash
npm run build
npm start
```

---

**Integração Completa**: Nexano + Supabase
