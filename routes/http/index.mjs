import express from 'express';

import userRoutes from './user';

const router = express.Router(); // eslint-disable-line new-cap

router.use('/user', userRoutes);

export default router;
