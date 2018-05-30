import express from 'express';

import userRoutes from './user';
import companyRoutes from './company';

const router = express.Router(); // eslint-disable-line new-cap

router.use('/user', userRoutes);
router.use('/company', companyRoutes);

export default router;
