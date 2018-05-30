import check from 'express-validator/check';

const { body } = check;

export const ID = [body('id').exists(), body('name').isString()];

export const NAME = [body('name').exists(), body('name').isLength({ min: 1 })];
