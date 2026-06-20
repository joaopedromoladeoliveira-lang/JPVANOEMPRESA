# 🚀 JPvano - Guia de Instalação e Setup

Um guia completo para configurar e iniciar a plataforma JPvano em seu ambiente local.

## 📋 Pré-requisitos

### Windows

```powershell
# Verificar versões
node --version  # v18 ou superior
npm --version   # v9 ou superior
git --version
```

### Instalar Dependências

#### Node.js
1. Baixar em: https://nodejs.org/
2. Instalar versão LTS (18+)
3. Verificar: `node --version`

#### PostgreSQL
1. Baixar em: https://www.postgresql.org/download/windows/
2. Instalar com pgAdmin 4
3. Anotar senha do usuário `postgres`
4. Verificar: `psql --version`

#### Git
1. Baixar em: https://git-scm.com/
2. Instalar com opções padrão
3. Verificar: `git --version`

#### Docker (opcional)
1. Baixar em: https://www.docker.com/products/docker-desktop
2. Instalar e ativar

## 📂 Estrutura de Pastas

```
C:\Users\seu_usuario\
└── Dev\  (ou sua pasta de projetos)
    └── jpvano\
        ├── jpvano-backend\
        ├── jpvano-frontend\
        ├── docker-compose.yml
        ├── README.md
        └── CONFIGURATION.md
```

## 🔧 Passo 1: Clonar/Copiar o Projeto

```bash
cd C:\Users\seu_usuario\Dev
git clone <url_do_repositorio>
cd jpvano
```

## 🗄️ Passo 2: Configurar PostgreSQL

### Windows - PowerShell

```powershell
# Abrir PowerShell como Administrador
psql -U postgres

# No prompt psql:
CREATE DATABASE jpvano_db;
CREATE USER jpvano_user WITH PASSWORD 'senha123';
ALTER ROLE jpvano_user SET client_encoding TO 'utf8';
ALTER ROLE jpvano_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE jpvano_user SET default_transaction_deferrable TO on;
ALTER ROLE jpvano_user SET default_time_zone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE jpvano_db TO jpvano_user;
\q  # Sair
```

### Verificar Conexão

```bash
psql -U jpvano_user -d jpvano_db -h localhost
```

## ⚙️ Passo 3: Configurar Backend

### Terminal 1 - Backend Setup

```bash
cd jpvano-backend

# Criar arquivo .env
copy .env.example .env
# ou em Linux/Mac:
cp .env.example .env
```

### Editar `.jpvano-backend\.env`

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jpvano_db
DB_USER=jpvano_user
DB_PASSWORD=senha123
DB_SSL=false

# Server
SERVER_PORT=5000
NODE_ENV=development

# JWT (IMPORTANTE: Gerar chaves aleatórias)
JWT_SECRET=sua_chave_secreta_aleatoria_minimo_32_caracteres_aqui_aleatorios
JWT_REFRESH_SECRET=outra_chave_aleatoria_diferente_minimo_32_caracteres_aqui
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=7d

# Email (Usar Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=seu_email@gmail.com
EMAIL_PASSWORD=sua_app_password
EMAIL_FROM=noreply@jpvano.com

# Frontend
FRONTEND_URL=http://localhost:3000

# Admin Account (Padrão)
ADMIN_EMAIL=joaopedromoladeoliveira@gmail.com
ADMIN_PASSWORD=Pedro12@
```

### Gerar JWT Secret (PowerShell)

```powershell
# Instalar se não tiver
npm install -g crypto-random-string

# Gerar chave
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Instalar Dependências

```bash
npm install
```

## ⚙️ Passo 4: Configurar Frontend

### Terminal 2 - Frontend Setup

```bash
cd jpvano-frontend

# Criar arquivo .env.local
copy .env.example .env.local
# ou em Linux/Mac:
cp .env.example .env.local
```

### Editar `.jpvano-frontend\.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=JPvano
```

### Instalar Dependências

```bash
npm install
```

## 🚀 Passo 5: Iniciar o Desenvolvimento

### Terminal 1 - Backend

```bash
cd jpvano-backend
npm run dev
```

**Esperado:**
```
✓ Conexão com banco de dados estabelecida
✓ Modelos sincronizados
✓ Servidor rodando em http://localhost:5000
✓ Socket.io ativo em ws://localhost:5000
```

### Terminal 2 - Frontend

```bash
cd jpvano-frontend
npm run dev
```

**Esperado:**
```
▲ Next.js 14.0.0
- Local: http://localhost:3000
- Environments: .env.local

✓ Ready in 2.5s
```

## ✅ Passo 6: Testar Aplicação

### Acessar URLs

1. **Frontend**: http://localhost:3000
2. **Backend API**: http://localhost:5000/api
3. **Health Check**: http://localhost:5000/health

### Criar Conta de Teste

1. Ir para: http://localhost:3000/register
2. Preencher formulário
3. Clicar em "Registrar"
4. Verificar email (console)

### Login com Admin

1. Ir para: http://localhost:3000/login
2. Email: `joaopedromoladeoliveira@gmail.com`
3. Senha: `Pedro12@`
4. Clicar em "Entrar"

## 🐛 Troubleshooting

### Erro: "Can't connect to database"

```bash
# Verificar se PostgreSQL está rodando
psql -U postgres

# Se erro, reiniciar PostgreSQL
# Windows: Services → PostgreSQL → Restart
```

### Erro: "Port 5000 already in use"

```bash
# Encontrar processo
netstat -ano | findstr :5000

# Matar processo
taskkill /PID <PID> /F

# Ou mudar porta em .env
SERVER_PORT=5001
```

### Erro: "Port 3000 already in use"

```bash
# Usar porta diferente
npm run dev -- -p 3001
```

### Erro: "ENOENT: no such file or directory .env"

```bash
# Certificar que .env existe
cd jpvano-backend
copy .env.example .env
```

### Erro: "Cannot find module"

```bash
# Limpar cache e reinstalar
rm -r node_modules package-lock.json
npm install
```

### Erro: "Email not sending"

1. Verificar credenciais Gmail
2. Ativar "App Passwords": https://myaccount.google.com/apppasswords
3. Usar app password em `.env`

## 📊 Verificar Instalação

### Backend Health Check

```bash
curl http://localhost:5000/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2024-06-19T10:30:00Z"
}
```

### Database Check

```bash
psql -U jpvano_user -d jpvano_db -c "SELECT COUNT(*) FROM users;"
```

### API Test

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "username":"testuser",
    "password":"Senha@123",
    "firstName":"Test",
    "lastName":"User"
  }'
```

## 🔄 Reiniciar Desenvolvimento

Se precisar limpar e recomeçar:

```bash
# Backend
cd jpvano-backend
rm -r node_modules dist
npm install
npm run migrate  # Resincronizar BD

# Frontend
cd jpvano-frontend
rm -r node_modules .next
npm install
```

## 📱 Testar Responsividade

### Browser DevTools

1. Pressionar `F12`
2. Clicar em "Toggle device toolbar" (Ctrl+Shift+M)
3. Testar em diferentes resoluções:
   - Mobile: 375x667
   - Tablet: 768x1024
   - Desktop: 1920x1080

## 🎨 Features para Testar

- ✅ Registro de usuário
- ✅ Login
- ✅ Criar perfil
- ✅ Upload de foto
- ✅ Criar post
- ✅ Like/Unlike
- ✅ Comentários
- ✅ Seguir/Deixar de seguir
- ✅ Modo escuro/claro
- ✅ Responsividade

## 📝 Próximos Passos

1. **Completar Features**
   - Messaging system
   - Stories e Reels
   - Live streaming
   - Verification system

2. **Setup Payment**
   - Integrar Stripe
   - Sistema de assinatura
   - Monetização

3. **DevOps**
   - Docker setup
   - CI/CD pipeline
   - Deployment

4. **Testing**
   - Unit tests
   - E2E tests
   - Load testing

## 🆘 Precisa de Ajuda?

### Comando úteis

```bash
# Ver versão do Node
node --version

# Ver versão do npm
npm --version

# Atualizar npm
npm install -g npm@latest

# Limpar cache npm
npm cache clean --force

# Ver processos em portas
netstat -ano

# Ver logs em tempo real
npm run dev | tee logs.txt
```

### Recursos

- **Documentação**: Veja `README.md`
- **Configurações**: Veja `CONFIGURATION.md`
- **Issues**: Abra um issue no GitHub

## 🎉 Parabéns!

Você configurou com sucesso a plataforma JPvano! 

Agora você pode:
- Explorar a interface
- Desenvolver novas features
- Customizar conforme necessário
- Deploy em produção

---

**Última atualização**: Junho 2024
