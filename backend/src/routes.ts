import { Router } from 'express';
import { userRoutes } from './modules/user';
import { healthRoutes } from './modules/health';

const router = Router();

router.get('/', (_req, res) => res.status(200).json({ message: 'Hello World' }));

router.use('/users', userRoutes);

router.use('/health', healthRoutes);


export default router;
