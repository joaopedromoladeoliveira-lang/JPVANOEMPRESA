# JPvano Configuration Guide

## 🔧 Configurações Importantes

### 1. Variáveis de Ambiente (Backend)

#### Database
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jpvano_db
DB_USER=postgres
DB_PASSWORD=seu_password_seguro
DB_SSL=false
```

#### Server
```
SERVER_PORT=5000
NODE_ENV=development  # ou 'production'
```

#### JWT (ALTERAR EM PRODUÇÃO!)
```
JWT_SECRET=gere_uma_chave_aleatoria_longa_muito_segura
JWT_REFRESH_SECRET=outra_chave_aleatoria_diferente
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=7d
```

#### Email (Gmail)
1. Acesse: https://myaccount.google.com/apppasswords
2. Gere uma "App Password"
3. Configure:
```
EMAIL_SERVICE=gmail
EMAIL_USER=seu_email@gmail.com
EMAIL_PASSWORD=app_password_gerada
EMAIL_FROM=noreply@jpvano.com
```

#### Google OAuth
1. Vá para: https://console.cloud.google.com
2. Crie um projeto novo
3. Configure OAuth 2.0
4. Gere credenciais:
```
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
```

#### Storage (AWS S3 ou Local)
```
STORAGE_TYPE=local  # ou 's3'
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua_chave
AWS_SECRET_ACCESS_KEY=sua_chave_secreta
AWS_S3_BUCKET=jpvano-uploads
```

#### Admin Account
```
ADMIN_EMAIL=joaopedromoladeoliveira@gmail.com
ADMIN_PASSWORD=Pedro12@
```

#### Rate Limiting
```
RATE_LIMIT_WINDOW_MS=900000  # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Variáveis de Ambiente (Frontend)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=JPvano
```

## 🔐 Segurança em Produção

### 1. Senhas Fortes
```
JWT_SECRET: Mínimo 32 caracteres aleatórios
- Usar: openssl rand -base64 32
```

### 2. HTTPS
```nginx
server {
    listen 443 ssl;
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
}
```

### 3. CORS Configurado
```
FRONTEND_URL=https://seu_dominio.com
```

### 4. Database
- Use senha forte
- Backup regular
- SSL ativado
- Firewall configurado

### 5. Variáveis Secretas
- Nunca commitar `.env`
- Use secrets manager (GitHub Actions, AWS Secrets)
- Rotacione chaves regularmente

## 📊 Banco de Dados

### Criar Database
```sql
CREATE DATABASE jpvano_db;
CREATE USER jpvano_user WITH PASSWORD 'senha_forte';
GRANT ALL PRIVILEGES ON DATABASE jpvano_db TO jpvano_user;
```

### Migrations
```bash
npm run migrate
```

### Seeding (teste)
```bash
npm run seed
```

## 🚀 Performance

### Otimizações Implementadas

1. **Frontend**
   - Code splitting com Next.js
   - Image optimization
   - CSS minification
   - API caching

2. **Backend**
   - Database indexing
   - Connection pooling
   - Response compression (gzip)
   - Rate limiting

3. **Database**
   - Índices em campos frequentes
   - Pagination
   - Query optimization

### Monitoramento
```bash
# Health check
curl http://localhost:5000/health

# Logs
npm run dev 2>&1 | tee logs.txt
```

## 🔄 Atualizar Dependências

```bash
# Check updates
npm outdated

# Update
npm update

# Update major versions
npm install -g npm-check-updates
ncu -u
npm install
```

## 📱 Responsividade

- Mobile: 320px - 640px
- Tablet: 640px - 1024px
- Desktop: 1024px+

Testado em:
- Chrome
- Firefox
- Safari
- Edge
- Mobile Safari
- Chrome Mobile

## 🧪 Testing (Para Implementar)

```bash
# Backend Tests
npm test

# Frontend Tests
npm run test:frontend

# E2E Tests
npm run test:e2e
```

## 📝 Notas Importantes

1. **Backup Regular**: Configure backups automáticos do PostgreSQL
2. **Rate Limiting**: Ajuste conforme carga esperada
3. **Email**: Use serviço profissional em produção (SendGrid, etc)
4. **CDN**: Configure CDN para assets estáticos
5. **SSL**: Sempre usar HTTPS em produção
6. **Monitoramento**: Configure logs e alertas

## 🆘 Troubleshooting

### Erro: "Can't connect to database"
- Verificar PostgreSQL está rodando
- Verificar credenciais em `.env`
- Verificar firewall

### Erro: "Token invalid"
- Limpar localStorage
- Fazer login novamente
- Verificar JWT_SECRET

### Erro: "CORS error"
- Verificar FRONTEND_URL em .env
- Verificar headers no browser

### Erro: "Email not sending"
- Verificar credenciais Gmail
- Ativar "Less secure apps" ou usar App Password
- Verificar logs

---

**Última atualização**: Junho 2024
