import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import TokenService from './src/features/token/token.service';
import SecurityMiddleware from './src/middleware/security.middleware';
import authRoutes from './src/features/auth/auth.routes';

const app = express();
export default app;
const PORT = Number(process.env.PORT) || 8080;

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';
if (!JWT_SECRET) throw new Error('Missing JWT_SECRET environment variable');

const tokenService = new TokenService(jwt, JWT_SECRET, JWT_EXPIRES_IN);
const security = SecurityMiddleware(tokenService);

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('All is well! Connected to the server!');
});

app.use('/auth', authRoutes);

app.get('/protected', security.authenticateJWT, (req, res) => {
  res.json({ ok: true, user: (req as any).user });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}