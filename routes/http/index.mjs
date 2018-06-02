import express from 'express';

import userRoutes from './user';
import companyRoutes from './company';
import parcelRoutes from './parcel';
import robotRoutes from './robot';

const router = express.Router(); // eslint-disable-line new-cap

router.use('/user', userRoutes);
router.use('/company', companyRoutes);
router.use('/parcel', parcelRoutes);
router.use('/robot', robotRoutes);

export default router;
