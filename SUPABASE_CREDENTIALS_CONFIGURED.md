# ✅ JPvano - Credenciais Supabase Configuradas

## 🎯 Status: PRONTO PARA CONFIGURAR BANCO DE DADOS

Suas credenciais Supabase foram configuradas em:
- ✅ `jpvano-payments/.env`
- ✅ `jpvano-frontend/.env.local`

---

## 📊 Credenciais

```
Project URL:  https://qevqyqoifqdywddnqqdl.supabase.co
Anon Key:     sb_publishable_GzovdG_CodOitnMwHnR5mQ_BQ_xVlfM
```

---

## 🚀 Próximas Etapas

### 1️⃣ Acessar Supabase Dashboard

```
https://app.supabase.com
→ Selecione seu projeto
→ Vá para SQL Editor
```

### 2️⃣ Criar Tabelas

Copie TODO o SQL abaixo e execute no SQL Editor:

```sql
-- ============================================
-- JPvano Database Schema
-- ============================================

-- Tabela de Perfis de Usuários
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY,
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
CREATE TABLE IF NOT EXISTS payments (
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
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Posts
CREATE TABLE IF NOT EXISTS posts (
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
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Likes
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id)
);

-- Tabela de Followers
CREATE TABLE IF NOT EXISTS followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'accepted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id)
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following_id ON followers(following_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

-- Política: Usuários veem apenas seus dados de perfil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public profiles"
ON profiles FOR SELECT USING (status = 'active');

-- Política: Usuários veem apenas seus pagamentos
CREATE POLICY "Users can view own payments"
ON payments FOR SELECT USING (auth.uid() = user_id);

-- Política: Posts são públicos para leitura
CREATE POLICY "Posts are viewable by everyone"
ON posts FOR SELECT USING (true);

CREATE POLICY "Users can delete own posts"
ON posts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert posts"
ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: Comentários são públicos
CREATE POLICY "Comments are viewable by everyone"
ON comments FOR SELECT USING (true);

CREATE POLICY "Users can insert comments"
ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
ON comments FOR DELETE USING (auth.uid() = user_id);
```

### 3️⃣ Executar SQL

1. **Copie TODO o SQL acima**
2. **Cole no SQL Editor do Supabase**
3. **Clique em "Run"**
4. **Aguarde conclusão** ✅

---

## ✅ Verificar Criação

Após executar SQL, você deve ver em **Table Editor**:

- ✅ `profiles`
- ✅ `payments`
- ✅ `admin_logs`
- ✅ `posts`
- ✅ `comments`
- ✅ `likes`
- ✅ `followers`

---

## 🚀 Próximo: Testar Sistema

### 1. Iniciar Payments Service

```bash
cd jpvano-payments
npm install
npm run dev
```

**Esperado:**
```
╔═══════════════════════════════════════╗
║  JPvano Payments Service             ║
║  🚀 Running on port 5001              ║
║  💳 Nexano Integration Active         ║
║  ⚙️  Supabase Connected               ║
╚═══════════════════════════════════════╝
```

### 2. Iniciar Frontend

```bash
cd jpvano-frontend
npm run dev
```

**Esperado:**
```
▲ Next.js 14.0.0
- Local: http://localhost:3000
```

### 3. Testar no Navegador

1. Acesse: http://localhost:3000
2. Clique em "Plano Premium"
3. Selecione plano
4. Preencha dados
5. Clique "Continuar"

---

## 🔐 Service Key (Importante)

⚠️ **AINDA FALTA**: Obter a `Service Key` do Supabase

### Como Obter:

1. **Supabase Dashboard**
   - Settings → API
   - Procure por **service_role key**
   - Copie a chave

2. **Adicione ao .env**

```bash
# jpvano-payments/.env
SUPABASE_SERVICE_KEY=sua_service_key_aqui
```

Esta chave é usada para operações administrativas (admin operations).

---

## 🌐 Webhooks Nexano

⚠️ **PRÓXIMO PASSO**: Configurar webhook no Nexano

### 1. Testar Localmente com ngrok

```bash
npm install -g ngrok
ngrok http 5001
# Copia: https://xxxx-xxx-xxx.ngrok.io
```

### 2. Configurar em Nexano Dashboard

1. Vá para: https://dashboard.nexano.io
2. Settings → Webhooks
3. Adicionar webhook:
   - **URL**: `https://xxxx-xxx-xxx.ngrok.io/api/webhooks/nexano`
   - **Eventos**: `payment.completed`, `payment.failed`
4. **Save**

### 3. Testar Webhook

1. No Nexano Dashboard
2. Webhooks → Test
3. Enviar webhook de teste
4. Ver logs em `npm run dev`

---

## 📊 Arquitetura Configurada

```
┌─────────────────────────────────────┐
│     Frontend (Next.js)              │
│  http://localhost:3000              │
│  ✅ Supabase Auth Pronto            │
│  ✅ Componentes de Pagamento        │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│    Payments Service (Node.js)       │
│    http://localhost:5001            │
│    ✅ Nexano Integrado              │
│    ✅ Supabase Conectado            │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
   ✅ Nexano    ✅ Supabase
   Payments    Database
```

---

## 📋 Checklist Conclusão

- [x] Credenciais Nexano configuradas
- [x] Credenciais Supabase configuradas
- [ ] Tabelas criadas no Supabase
- [ ] Service Key obtida e configurada
- [ ] Webhook Nexano configurado
- [ ] Testar assinatura completa

---

## 🆘 Precisa de Ajuda?

### Erros Comuns

**"Connection refused"**
- Verificar se `npm run dev` está rodando
- Verificar porta 5001

**"Supabase connection error"**
- Verificar URL em .env
- Verificar chave do Supabase
- Aguardar carregamento do projeto

**"Webhook not received"**
- Usar ngrok para expor localhost
- Verificar URL em Nexano Dashboard
- Ver logs: `npm run dev 2>&1 | grep webhook`

---

**Status: Sistema Pronto para Usar** ✅

Próximo passo: [Criar Tabelas no Supabase](#2️⃣-criar-tabelas)
