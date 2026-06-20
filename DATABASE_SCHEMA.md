# 📊 JPvano - Database Schema

## 🗄️ Tabelas Principais

### 1. **users**
Armazena informações de usuários

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(30) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    bio TEXT DEFAULT '',
    profilePicture VARCHAR(255),
    coverImage VARCHAR(255),
    websiteUrl VARCHAR(255),
    isPrivate BOOLEAN DEFAULT FALSE,
    isVerified BOOLEAN DEFAULT FALSE,
    verifiedBadge BOOLEAN DEFAULT FALSE,
    twoFactorEnabled BOOLEAN DEFAULT FALSE,
    twoFactorSecret VARCHAR(255),
    googleId VARCHAR(255) UNIQUE,
    emailVerified BOOLEAN DEFAULT FALSE,
    emailVerificationToken VARCHAR(255),
    passwordResetToken VARCHAR(255),
    passwordResetExpires TIMESTAMP,
    role ENUM('user', 'admin', 'moderator') DEFAULT 'user',
    status ENUM('active', 'suspended', 'banned') DEFAULT 'active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INDEXES:
- email (UNIQUE)
- username (UNIQUE)
- status
- role
- createdAt
```

### 2. **posts**
Armazena posts de usuários

```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY,
    userId UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    description TEXT,
    type ENUM('image', 'video', 'carousel', 'text', 'story', 'reel') DEFAULT 'text',
    mediaUrls TEXT[] DEFAULT '{}',
    likesCount INT DEFAULT 0,
    commentsCount INT DEFAULT 0,
    sharesCount INT DEFAULT 0,
    savesCount INT DEFAULT 0,
    isPublished BOOLEAN DEFAULT TRUE,
    allowComments BOOLEAN DEFAULT TRUE,
    allowShares BOOLEAN DEFAULT TRUE,
    reportedCount INT DEFAULT 0,
    reportStatus ENUM('pending', 'reviewed', 'approved', 'removed') DEFAULT 'approved',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP (paranoid delete)
);

INDEXES:
- userId
- createdAt
- reportStatus
```

### 3. **comments**
Armazena comentários em posts

```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY,
    postId UUID NOT NULL REFERENCES posts(id),
    userId UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    likesCount INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP
);

INDEXES:
- postId
- userId
- createdAt
```

### 4. **likes**
Rastreia likes em posts e comentários

```sql
CREATE TABLE likes (
    id UUID PRIMARY KEY,
    userId UUID NOT NULL REFERENCES users(id),
    postId UUID REFERENCES posts(id),
    commentId UUID REFERENCES comments(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(userId, postId),
    UNIQUE(userId, commentId)
);

INDEXES:
- userId
- postId
- commentId
```

### 5. **follows**
Relacionamento entre seguidores

```sql
CREATE TABLE follows (
    id UUID PRIMARY KEY,
    followerId UUID NOT NULL REFERENCES users(id),
    followingId UUID NOT NULL REFERENCES users(id),
    status ENUM('pending', 'accepted', 'blocked') DEFAULT 'accepted',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(followerId, followingId)
);

INDEXES:
- followerId
- followingId
```

### 6. **messages**
Mensagens privadas entre usuários

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    senderId UUID NOT NULL REFERENCES users(id),
    recipientId UUID REFERENCES users(id),
    conversationId UUID,
    content TEXT NOT NULL,
    mediaUrls TEXT[] DEFAULT '{}',
    messageType ENUM('text', 'image', 'video', 'voice', 'emoji') DEFAULT 'text',
    isRead BOOLEAN DEFAULT FALSE,
    readAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP
);

INDEXES:
- senderId
- recipientId
- conversationId
- createdAt
```

### 7. **verifications**
Sistema de verificação de identidade

```sql
CREATE TABLE verifications (
    id UUID PRIMARY KEY,
    userId UUID NOT NULL UNIQUE REFERENCES users(id),
    status ENUM('pending', 'under_review', 'approved', 'rejected') DEFAULT 'pending',
    documentType ENUM('passport', 'national_id', 'drivers_license') NOT NULL,
    documentUrl VARCHAR(255) NOT NULL,
    documentHash VARCHAR(255) NOT NULL,
    selfieUrl VARCHAR(255),
    selfieHash VARCHAR(255),
    verificationNotes TEXT,
    rejectionReason TEXT,
    submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewedAt TIMESTAMP,
    reviewedBy UUID REFERENCES users(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INDEXES:
- userId (UNIQUE)
- status
- submittedAt
```

### 8. **saves**
Posts salvos por usuários

```sql
CREATE TABLE saves (
    id UUID PRIMARY KEY,
    userId UUID NOT NULL REFERENCES users(id),
    postId UUID NOT NULL REFERENCES posts(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(userId, postId)
);

INDEXES:
- userId
- postId
```

### 9. **reports**
Sistema de denúncias

```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY,
    reportedById UUID NOT NULL REFERENCES users(id),
    postId UUID REFERENCES posts(id),
    commentId UUID REFERENCES comments(id),
    userId UUID REFERENCES users(id),
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pending', 'reviewed', 'resolved', 'dismissed') DEFAULT 'pending',
    action VARCHAR(255),
    reviewedBy UUID REFERENCES users(id),
    reviewedAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INDEXES:
- reportedById
- postId
- commentId
- userId
- status
- createdAt
```

### 10. **subscriptions**
Assinaturas de usuários

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    userId UUID NOT NULL REFERENCES users(id),
    tier ENUM('free', 'pro', 'creator') DEFAULT 'free',
    status ENUM('active', 'inactive', 'cancelled', 'expired') DEFAULT 'active',
    startDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    endDate TIMESTAMP,
    autoRenew BOOLEAN DEFAULT TRUE,
    price DECIMAL(10, 2) DEFAULT 0,
    features TEXT[] DEFAULT '{}',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INDEXES:
- userId
- status
- tier
```

### 11. **advertisements**
Anúncios pagos

```sql
CREATE TABLE advertisements (
    id UUID PRIMARY KEY,
    userId UUID NOT NULL REFERENCES users(id),
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    imageUrl VARCHAR(255) NOT NULL,
    targetUrl VARCHAR(255),
    budget DECIMAL(10, 2) NOT NULL,
    dailyBudget DECIMAL(10, 2),
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    conversions INT DEFAULT 0,
    ctr DECIMAL(5, 2) DEFAULT 0,
    status ENUM('draft', 'pending', 'active', 'paused', 'completed') DEFAULT 'draft',
    startDate TIMESTAMP NOT NULL,
    endDate TIMESTAMP NOT NULL,
    targetAudience VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INDEXES:
- userId
- status
- startDate
```

### 12. **notifications**
Notificações para usuários

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    userId UUID NOT NULL REFERENCES users(id),
    type ENUM('like', 'comment', 'follow', 'message', 'mention', 'verification', 'system') NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    data JSONB,
    isRead BOOLEAN DEFAULT FALSE,
    readAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INDEXES:
- userId
- type
- isRead
- createdAt
```

## 📊 Relacionamentos

```
users (1) ──────→ (M) posts
users (1) ──────→ (M) comments
users (1) ──────→ (M) likes
users (1) ──────→ (M) follows (as follower)
users (1) ──────→ (M) follows (as following)
users (1) ──────→ (M) messages (as sender)
users (1) ──────→ (M) messages (as recipient)
users (1) ──────→ (1) verifications
users (1) ──────→ (M) saves
users (1) ──────→ (M) reports
users (1) ──────→ (M) subscriptions
users (1) ──────→ (M) advertisements
users (1) ──────→ (M) notifications

posts (1) ──────→ (M) comments
posts (1) ──────→ (M) likes
posts (1) ──────→ (M) saves

comments (1) ───→ (M) likes

reports (M) ────→ (1) posts
reports (M) ────→ (1) comments
reports (M) ────→ (1) users
```

## 🔐 Segurança

### Encryption
- **Passwords**: Bcrypt (10 salts)
- **Documents**: SHA256 hash para verificação
- **Tokens**: JWT (HS256)

### Access Control
- **Role-based**: user, admin, moderator
- **Status-based**: active, suspended, banned
- **Privacy**: isPrivate para perfis

### Data Protection
- Soft delete (paranoid) para posts e comentários
- Hash de documentos para integridade
- HTTPS em produção

## 📈 Performance

### Query Optimization
- Índices em campos frequentes
- Lazy loading de relacionamentos
- Pagination obrigatória

### Caching
- Redis (implementar)
- Browser cache
- API cache (304 Not Modified)

## 🔄 Migrations

```bash
# Criar nova migration
npm run migrate

# Revert migration
npm run migrate:undo

# Status
npm run migrate:status
```

## 📝 Exemplo de Dados

```sql
-- Inserir usuário
INSERT INTO users (id, email, username, password, firstName, lastName, role, status)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'user@example.com',
  'username123',
  'hashed_password_here',
  'João',
  'Silva',
  'user',
  'active'
);

-- Inserir post
INSERT INTO posts (id, userId, content, type, isPublished)
VALUES (
  '223e4567-e89b-12d3-a456-426614174000',
  '123e4567-e89b-12d3-a456-426614174000',
  'Meu primeiro post!',
  'text',
  true
);

-- Inserir like
INSERT INTO likes (id, userId, postId)
VALUES (
  '323e4567-e89b-12d3-a456-426614174000',
  '123e4567-e89b-12d3-a456-426614174000',
  '223e4567-e89b-12d3-a456-426614174000'
);
```

---

**Documentação do Schema** - Última atualização: Junho 2024
