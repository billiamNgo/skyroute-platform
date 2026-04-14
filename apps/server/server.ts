import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import TokenService from './src/features/token/token.service';
import SecurityMiddleware from './src/middleware/security.middleware';
import authRoutes from './src/features/auth/auth.routes';
import pharmacyRoutes from './src/features/pharmacies/pharmacy.routes';
import orderRoutes from './src/features/orders/order.routes';
import droneRoutes from './src/features/drones/drone.routes';
import userRoutes from './src/features/users/user.routes';

const app = express();
const PORT = Number(process.env.PORT) || 8080;

// 1. Environment variable checks
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';
if (!JWT_SECRET) throw new Error('Missing JWT_SECRET environment variable');

// 2. Security middleware setup
const tokenService = new TokenService(jwt, JWT_SECRET, JWT_EXPIRES_IN);
const security = SecurityMiddleware(tokenService);

// 3. Global middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// 4. Feature Routes
app.use('/auth', authRoutes);
app.use('/pharmacy', pharmacyRoutes(security));
app.use('/orders', orderRoutes(security));
app.use('/drones', droneRoutes(security));
app.use('/users', userRoutes(security));

// 5. Test route
app.get('/', (req, res) => {
  res.send('All is well! Connected to the server!');
});

app.get('/protected', security.authenticateJWT, (req, res) => {
  res.json({ ok: true, user: (req as any).user });
});

// 6. Spin up the server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}

export default app;