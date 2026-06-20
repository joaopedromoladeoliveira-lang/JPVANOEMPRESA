# JPvano - Premium Social Network Platform

Uma plataforma social moderna, escalável e totalmente funcional inspirada em Instagram, com recursos únicos e premium.

## 📋 Índice

- [Características Principais](#características-principais)
- [Requisitos Técnicos](#requisitos-técnicos)
- [Configuração Inicial](#configuração-inicial)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Autenticação](#autenticação)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Segurança](#segurança)

## ✨ Características Principais

### Autenticação e Segurança
- ✅ Registro e login com email/senha
- ✅ Autenticação com Google
- ✅ Autenticação de Dois Fatores (2FA)
- ✅ Recuperação de senha via email
- ✅ Verificação de email
- ✅ Proteção contra CSRF e XSS
- ✅ Rate limiting
- ✅ Senhas criptografadas com bcrypt

### Perfil do Usuário
- ✅ Foto de perfil
- ✅ Imagem de capa
- ✅ Bio
- ✅ Website link
- ✅ Contador de seguidores
- ✅ Sistema de verificação
- ✅ Perfil privado/público
- ✅ Temas customizáveis (Premium)

### Feed e Posts
- ✅ Posts com imagens, vídeos, carrosséis
- ✅ Stories (24 horas)
- ✅ Reels
- ✅ Scroll infinito
- ✅ Like, comentários, compartilhamento
- ✅ Salvamento de posts
- ✅ Recomendações baseadas em IA
- ✅ Sistema de relatório

### Mensagens
- ✅ Mensagens privadas
- ✅ Suporte a imagens e vídeos
- ✅ Mensagens de voz
- ✅ Indicador de digitação
- ✅ Recibos de leitura
- ✅ Chats em grupo
- ✅ Chamadas de áudio e vídeo (WebRTC)

### Sistema de Monetização
- ✅ Assinaturas de criador
- ✅ Doações
- ✅ Venda de produtos digitais
- ✅ Sistema de anúncios
- ✅ Contas premium
- ✅ Dashboard analítico

### Admin Dashboard
- ✅ Gerenciamento de usuários
- ✅ Suspensão/banimento de contas
- ✅ Concessão de badges verificados
- ✅ Gerenciamento de assinaturas
- ✅ Dashboard de receita em tempo real
- ✅ Moderação de conteúdo
- ✅ Gerenciamento de anúncios

## 🔧 Requisitos Técnicos

### Stack de Tecnologia

**Backend:**
- Node.js 18+
- Express.js 4+
- TypeScript 5+
- PostgreSQL 14+
- Socket.io 4+

**Frontend:**
- Next.js 14+
- React 18+
- TypeScript 5+
- Tailwind CSS 3+
- Zustand (State Management)

**DevOps:**
- Docker
- Docker Compose
- Nginx
- Vercel (Frontend)

### Dependências de Sistema

```bash
# Windows
- PostgreSQL 14+
- Node.js 18+
- npm 9+ ou yarn 3+

# Linux
sudo apt-get install postgresql postgresql-contrib nodejs npm
```

## 🚀 Configuração Inicial

### 1. Clonar o Repositório

```bash
cd jpvano
```

### 2. Configurar Variáveis de Ambiente

**Backend:**
```bash
cd jpvano-backend
cp .env.example .env
```

Editar `.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jpvano_db
DB_USER=postgres
DB_PASSWORD=sua_senha

# Server
SERVER_PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=sua_chave_secreta_muito_longa_aqui
JWT_REFRESH_SECRET=outra_chave_secreta_longa_aqui

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=seu_email@gmail.com
EMAIL_PASSWORD=sua_senha_app_gmail

# Admin Account
ADMIN_EMAIL=joaopedromoladeoliveira@gmail.com
ADMIN_PASSWORD=Pedro12@

# Frontend
FRONTEND_URL=http://localhost:3000
```

**Frontend:**
```bash
cd jpvano-frontend
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=JPvano
```

### 3. Instalar Dependências

**Backend:**
```bash
cd jpvano-backend
npm install
```

**Frontend:**
```bash
cd jpvano-frontend
npm install
```

### 4. Setup do Banco de Dados

```bash
cd jpvano-backend

# Criar banco de dados
npm run migrate

# Popular com dados de teste (opcional)
npm run seed
```

### 5. Iniciar o Desenvolvimento

**Terminal 1 - Backend:**
```bash
cd jpvano-backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd jpvano-frontend
npm run dev
```

Acessar: http://localhost:3000

## 📁 Estrutura do Projeto

```
jpvano/
├── jpvano-backend/
│   ├── src/
│   │   ├── controllers/       # Lógica de negócio
│   │   ├── models/           # Modelos Sequelize
│   │   ├── routes/           # Rotas API
│   │   ├── middleware/       # Middleware
│   │   ├── validators/       # Validadores
│   │   ├── utils/            # Utilitários
│   │   ├── services/         # Serviços
│   │   ├── config/           # Configurações
│   │   └── server.ts         # Entrada principal
│   ├── uploads/              # Arquivos enviados
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── jpvano-frontend/
│   ├── src/
│   │   ├── app/              # Páginas (App Router)
│   │   ├── components/       # Componentes React
│   │   ├── contexts/         # Zustand stores
│   │   ├── hooks/            # Custom hooks
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Utilitários
│   │   └── styles/           # CSS global
│   ├── public/               # Assets estáticos
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── .env.local
│
└── README.md
```

## 🔐 Autenticação

### Fluxo de Registro

1. Usuário submete email, username, senha
2. Backend valida e cria usuário
3. Email de verificação é enviado
4. Usuário verifica email via token
5. Conta ativada

### Fluxo de Login

1. Usuário submete email e senha
2. Backend verifica credenciais
3. Se 2FA está ativado, solicita código
4. Retorna access token e refresh token
5. Tokens salvos no localStorage

### JWT Tokens

```json
{
  "accessToken": "eyJhbGc...",  // Válido por 24h
  "refreshToken": "eyJhbGc..."  // Válido por 7 dias
}
```

### 2FA Setup

```typescript
// 1. Enable 2FA
POST /api/auth/enable-2fa
Authorization: Bearer {token}

// 2. Confirm com código TOTP
POST /api/auth/confirm-2fa
{
  "secret": "JBSWY3DPEBLW64TMMQ======",
  "token": "123456"
}

// 3. Login com 2FA
POST /api/auth/verify-2fa
{
  "userId": "uuid",
  "token": "123456"
}
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Autenticação (Auth Endpoints)

#### Registro
```
POST /auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "username": "usuario123",
  "password": "Senha@123",
  "firstName": "João",
  "lastName": "Silva"
}

Response: 201
{
  "message": "Usuário registrado com sucesso",
  "user": { ... },
  "accessToken": "...",
  "refreshToken": "..."
}
```

#### Login
```
POST /auth/login
{
  "email": "usuario@example.com",
  "password": "Senha@123"
}

Response: 200
{
  "message": "Login realizado com sucesso",
  "user": { ... },
  "accessToken": "...",
  "refreshToken": "..."
}
```

#### Verificar Email
```
POST /auth/verify-email
{
  "token": "token_de_verificacao"
}

Response: 200
{
  "message": "E-mail verificado com sucesso",
  "user": { ... }
}
```

### Usuários (User Endpoints)

#### Obter Perfil
```
GET /users/{username}
Authorization: Bearer {token}

Response: 200
{
  "user": {
    "id": "uuid",
    "username": "usuario123",
    "email": "user@example.com",
    "firstName": "João",
    "lastName": "Silva",
    "bio": "...",
    "profilePicture": "...",
    "followersCount": 100,
    "followingCount": 50,
    "isFollowing": false,
    ...
  }
}
```

#### Atualizar Perfil
```
PUT /users/profile
Authorization: Bearer {token}
{
  "firstName": "João Pedro",
  "lastName": "Silva",
  "bio": "Desenvolvedor e creator",
  "websiteUrl": "https://exemplo.com",
  "isPrivate": false
}

Response: 200
{
  "message": "Perfil atualizado com sucesso",
  "user": { ... }
}
```

#### Upload Foto de Perfil
```
POST /users/profile-picture
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary data]

Response: 200
{
  "message": "Foto de perfil atualizada",
  "profilePicture": "/uploads/filename.jpg"
}
```

#### Seguir Usuário
```
POST /users/{userId}/follow
Authorization: Bearer {token}

Response: 201
{
  "message": "Seguindo usuário",
  "follow": { ... }
}
```

#### Deixar de Seguir
```
DELETE /users/{userId}/follow
Authorization: Bearer {token}

Response: 200
{
  "message": "Deixou de seguir usuário"
}
```

### Posts (Post Endpoints)

#### Criar Post
```
POST /posts
Authorization: Bearer {token}
{
  "content": "Novo post!",
  "type": "text|image|video|carousel|story|reel",
  "mediaUrls": ["url1", "url2"],
  "description": "Descrição do post"
}

Response: 201
{
  "message": "Post criado com sucesso",
  "post": { ... }
}
```

#### Obter Feed
```
GET /posts/feed?limit=20&offset=0
Authorization: Bearer {token}

Response: 200
{
  "posts": [ ... ],
  "total": 100,
  "hasMore": true
}
```

#### Like em Post
```
POST /posts/{postId}/like
Authorization: Bearer {token}

Response: 201
{
  "message": "Post curtido"
}
```

#### Comentar em Post
```
POST /posts/{postId}/comments
Authorization: Bearer {token}
{
  "content": "Comentário legal!"
}

Response: 201
{
  "message": "Comentário criado",
  "comment": { ... }
}
```

### Mensagens (Message Endpoints)

#### Enviar Mensagem
```
POST /messages
Authorization: Bearer {token}
{
  "recipientId": "uuid",
  "content": "Olá!",
  "messageType": "text"
}

Response: 201
{
  "message": "Mensagem enviada",
  "data": { ... }
}
```

#### Obter Conversas
```
GET /messages/conversations?limit=20
Authorization: Bearer {token}

Response: 200
{
  "conversations": [ ... ]
}
```

### Admin Endpoints

#### Obter Usuários
```
GET /admin/users?limit=20&offset=0
Authorization: Bearer {token}
Role: admin

Response: 200
{
  "users": [ ... ],
  "total": 500
}
```

#### Suspender Usuário
```
POST /admin/users/{userId}/suspend
Authorization: Bearer {token}
Role: admin
{
  "reason": "Violação de termos",
  "duration": 7  // dias
}

Response: 200
{
  "message": "Usuário suspenso"
}
```

#### Dashboard Financeiro
```
GET /admin/dashboard/revenue
Authorization: Bearer {token}
Role: admin

Response: 200
{
  "dailyRevenue": 1000,
  "weeklyRevenue": 7000,
  "monthlyRevenue": 30000,
  "annualRevenue": 360000,
  "activeSubscriptions": 250,
  "advertisingEarnings": 5000
}
```

## 🐳 Docker Deployment

### Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: jpvano_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: senha123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./jpvano-backend
    ports:
      - "5000:5000"
    environment:
      DB_HOST: postgres
      DB_NAME: jpvano_db
      DB_USER: postgres
      DB_PASSWORD: senha123
    depends_on:
      - postgres

  frontend:
    build: ./jpvano-frontend
    ports:
      - "3000:3000"

volumes:
  postgres_data:
```

### Build e Run

```bash
docker-compose up --build
```

## 🔒 Segurança

### Implementações de Segurança

1. **JWT Authentication** - Tokens seguros com expiração
2. **Bcrypt Hashing** - Senhas criptografadas
3. **CORS** - Controle de origem
4. **Helmet** - Headers de segurança HTTP
5. **Rate Limiting** - Proteção contra brute force
6. **Input Validation** - Validação com express-validator
7. **CSRF Protection** - Tokens CSRF
8. **XSS Prevention** - Sanitização de input
9. **SQL Injection Protection** - Parameterized queries

### Variáveis de Segurança

```env
# Alterar estas em produção!
JWT_SECRET=gere_uma_string_aleatoria_muito_longa
JWT_REFRESH_SECRET=outra_string_aleatoria_muito_longa
EMAIL_PASSWORD=use_app_password_do_gmail

# HTTPS em produção
NODE_ENV=production
```

## 🚀 Deployment em Produção

### Vercel (Frontend)

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Railway/Render (Backend)

1. Conectar repositório Git
2. Configurar variáveis de ambiente
3. Deploy automático

### AWS/Digital Ocean (Self-hosted)

```bash
# Build
npm run build

# Start
npm start

# Nginx reverse proxy
upstream backend {
  server localhost:5000;
}

server {
  listen 80;
  server_name api.jpvano.com;

  location / {
    proxy_pass http://backend;
    proxy_set_header Host $host;
  }
}
```



### Acessar Admin Dashboard
```
GET /admin/dashboard
Authorization: Bearer {admin_token}
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja LICENSE.md para detalhes

## 📧 Contato

- Email: support@jpvano.com
- Website: https://jpvano.com
- Twitter: @jpvano_oficial

---

**Desenvolvido com ❤️ pelo Time JPvano**
