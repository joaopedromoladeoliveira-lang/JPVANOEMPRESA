import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import sequelize from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

// Load environment variables
dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

const PORT = process.env.SERVER_PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('uploads'));

// Rate limiting
app.use(generalLimiter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API Routes (will be created)
app.use('/api/auth', (req: Request, res: Response) => {
  res.json({ message: 'Auth routes not yet implemented' });
});

app.use('/api/users', (req: Request, res: Response) => {
  res.json({ message: 'User routes not yet implemented' });
});

app.use('/api/posts', (req: Request, res: Response) => {
  res.json({ message: 'Post routes not yet implemented' });
});

app.use('/api/messages', (req: Request, res: Response) => {
  res.json({ message: 'Message routes not yet implemented' });
});

app.use('/api/admin', (req: Request, res: Response) => {
  res.json({ message: 'Admin routes not yet implemented' });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('message', (data) => {
    io.emit('message', data);
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler (must be last)
app.use(errorHandler);

// Database sync and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Conexão com banco de dados estabelecida');

    // Sync models
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✓ Modelos sincronizados');

    httpServer.listen(PORT, () => {
      console.log(`✓ Servidor rodando em http://localhost:${PORT}`);
      console.log(`✓ Socket.io ativo em ws://localhost:${PORT}`);
      console.log(`✓ Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('✗ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

export { app, io };
