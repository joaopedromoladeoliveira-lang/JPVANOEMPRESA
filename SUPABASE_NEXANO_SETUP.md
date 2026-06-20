# 🔐 Integração Supabase + Nexano - Guia Completo

## 📊 Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
│  - Autenticação Supabase Auth                           │
│  - Componentes de Pagamento                             │
│  - Dashboard do Usuário                                 │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ HTTPS
                 │
┌────────────────┴────────────────────────────────────────┐
│           Payments Service (Node + Express)             │
│  - Processamento de Pagamentos                          │
│  - Integração Nexano                                    │
│  - Webhooks                                             │
│  - Admin Dashboard API                                  │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────┴─────────┐
        │                  │
    Nexano            Supabase
    Payments          Database
```

---

## 🔑 Credenciais Nexano

```
API Key (Pública):  jpvanoempresa_20o9cjnqxzyrsn6i
API Secret (Secreta): awlooouq2xgpb59mnjkvmll98peupc1enfetj1251takzmyrdby6tlsnpln8d1v0
Base URL:          https://api.nexano.io
```

### ✅ Já Configurado em:
- `jpvano-payments/.env`

---

## 🗄️ Setup Supabase

### 1. Criar Projeto

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Selecione organização e region
4. Aguarde criação

### 2. Obter Credenciais

No dashboard do Supabase:

1. Settings → API
2. Copie:
   - **Project URL** → `SUPABASE_URL`
   - **anon public key** → `SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_KEY`

### 3. Configurar .env

```env
# jpvano-payments/.env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=seu_anon_key
SUPABASE_SERVICE_KEY=seu_service_key

# jpvano-frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu_anon_key
```

---

## 📋 Criar Tabelas no Supabase

### 1. SQL Editor

No Supabase Dashboard:
- SQL Editor → New Query

### 2. Copiar e Executar

```sql
-- Tabela de Perfis de Usuários
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  document VARCHAR(20) UNIQUE,
  avatar_url VARCHAR(500),
  bio TEXT,
  website VARCHAR(255),
  is_premium BOOLEAN DEFAULT false,
  premium_tier VARCHAR(50),
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'active',
  ban_reason TEXT,
  suspended_reason TEXT,
  suspended_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Pagamentos
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  nexano_payment_id VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type VARCHAR(50) NOT NULL,
  tier VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Logs do Admin
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls TEXT[],
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Comentários
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Likes
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id)
);

-- Tabela de Followers
CREATE TABLE followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'accepted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id)
);

-- Índices para Performance
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_followers_follower_id ON followers(follower_id);
CREATE INDEX idx_followers_following_id ON followers(following_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Política: Usuários veem apenas seus dados
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Políticas de Pagamentos
CREATE POLICY "Users can view own payments"
ON payments FOR SELECT USING (auth.uid() = user_id);

-- Políticas de Posts (públicos, mas deletáveis apenas pelo autor)
CREATE POLICY "Posts are viewable by everyone"
ON posts FOR SELECT USING (true);

CREATE POLICY "Users can delete own posts"
ON posts FOR DELETE USING (auth.uid() = user_id);
```

### 3. Confirmar Execução

Se sem erros, tabelas estão criadas ✅

---

## 🔐 Configurar Autenticação Supabase

### 1. Habilitar Provedores

Supabase Dashboard → Authentication → Providers

Ativar:
- ✅ Email
- ✅ Google OAuth (opcional)

### 2. Configurar Email

Authentication → Email Templates

Customizar templates de:
- Confirmação
- Reset de Senha
- Magic Link

---

## 🌐 Configurar Webhooks Nexano

### 1. Nexano Dashboard

1. Vá para: https://dashboard.nexano.io
2. Settings → Webhooks
3. Clique em "Add Webhook"

### 2. Configurar Webhook

**URL**: `https://seu-dominio.com/api/webhooks/nexano`

**Eventos**:
- ✅ payment.completed
- ✅ payment.failed
- ✅ payment.pending
- ✅ payment.refunded

**Teste**: Clique em "Send Test Event"

---

## 🚀 Fluxo Completo

### 1️⃣ Usuário se Cadastra

```
Frontend → Supabase Auth
↓
Cria conta com email/senha
↓
Perfil criado automaticamente
```

### 2️⃣ Usuário Compra Assinatura

```
Frontend (SubscriptionModal)
↓
POST /api/payments/subscribe
↓
Payments Service
↓
Nexano - Cria Payment Intent
↓
Redireciona para Checkout Nexano
```

### 3️⃣ Usuário Completa Pagamento

```
Nexano Checkout
↓
Pagamento Aprovado
↓
Nexano envia Webhook
↓
Seu servidor recebe webhook
↓
Verifica assinatura
↓
Atualiza Supabase (premium = true)
↓
Usuário recebe benefício
```

### 4️⃣ Admin Gerencia Usuários

```
Admin Dashboard
↓
GET /api/admin/revenue
↓
GET /api/admin/payments
↓
POST /api/admin/users/:id/ban
↓
POST /api/admin/users/:id/verify
```

---

## 💾 Variáveis de Ambiente

### jpvano-payments/.env

```env
# ✅ Já configurado
NEXANO_API_KEY=jpvanoempresa_20o9cjnqxzyrsn6i
NEXANO_API_SECRET=awlooouq2xgpb59mnjkvmll98peupc1enfetj1251takzmyrdby6tlsnpln8d1v0

# Alterar com suas credenciais Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=seu_anon_key
SUPABASE_SERVICE_KEY=seu_service_key

FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5001
PAYMENTS_PORT=5001
NODE_ENV=development
```

### jpvano-frontend/.env.local

```env
# Alterar com suas credenciais Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu_anon_key

NEXT_PUBLIC_PAYMENTS_API=http://localhost:5001/api
```

---

## 🧪 Testar Integração

### 1. Iniciar Serviços

```bash
# Terminal 1 - Payments Service
cd jpvano-payments
npm install
npm run dev
# Esperado: Running on port 5001

# Terminal 2 - Frontend
cd jpvano-frontend
npm run dev
# Esperado: http://localhost:3000
```

### 2. Testar Assinatura

1. Acesse: http://localhost:3000
2. Login/Registro
3. Clique em "Plano Premium"
4. Preencha dados
5. Clique em "Continuar"

### 3. Testar Webhook (Localhost)

Use ngrok para expor localhost:

```bash
ngrok http 5001
# Copia URL: https://xxxx.ngrok.io

# Configure em Nexano Dashboard:
# Webhook URL: https://jpvanoempresa.vercel.app/api/webhooks/nexano
```

---

## 📊 Monitorar Pagamentos

### No Supabase

1. Table Editor → payments
2. Veja pagamentos em tempo real

### No Nexano Dashboard

1. Transactions
2. Veja todas as transações
3. Status: pending, completed, failed

### Logs

```bash
cd jpvano-payments
npm run dev 2>&1 | grep -i payment
```

---

## 🔒 Segurança

### Verificação de Webhook

```typescript
// Automaticamente verificado em src/routes/webhooks.ts
const isValid = nexano.verifyWebhookSignature(payload, signature);
```

### Row Level Security (RLS)

- Usuários veem apenas seus dados
- Admins têm acesso total (implementar políticas)

### Senhas Seguras

- Supabase usa bcrypt automaticamente
- Nunca exponha chaves secretas

---

## 🆘 Troubleshooting

### Erro: "SUPABASE_URL not found"

```bash
# Verificar .env
cat jpvano-payments/.env

# Deve conter:
# SUPABASE_URL=https://...
# SUPABASE_ANON_KEY=...
```

### Webhook não funciona

1. Verificar URL configurada em Nexano
2. Verificar assinatura: `X-Nexano-Signature`
3. Ver logs: `npm run dev`

### Pagamento fica "pending" para sempre

1. Verificar webhook em Nexano Dashboard
2. Testar envio manual de webhook
3. Verificar erros em ngrok

### Usuário não fica premium após pagamento

1. Verificar status em Supabase: `payments` table
2. Verificar se webhook foi recebido
3. Ver logs do servidor

---

## 📈 Próximos Passos

1. **Deploy em Produção**
   - Railway/Render (Backend)
   - Vercel (Frontend)
   - Supabase Cloud

2. **Melhorias**
   - Email após pagamento
   - Dashboard analytics
   - Cancelamento de assinatura

3. **Features Premium**
   - Retirada de ganhos
   - Monetização de posts
   - Venda de produtos digitais

---

## 📞 Contato Suporte

- **Supabase**: https://supabase.io/support
- **Nexano**: https://nexano.io/support
- **JPvano**: support@jpvano.com

---

**Integração Completa** ✅
Última atualização: Junho 2026
