import check from 'express-validator/check';

const { body } = check;

export const ID = [body('id').exists(), body('id').isLength({ min: 1 })];

export const LEASER_ID = [
  body('leaser_id').exists(),
  body('leaser_id').isLength({ min: 1 }),
];

export const LEASER_ID_OPTIONAL = [
  body('leaser_id')
    .optional()
    .isLength({ min: 1 }),
];

export const MODEL = [body('model').exists(), body('model').isIn(['V1'])];

export const MODEL_OPTIONAL = [
  body('model')
    .optional()
    .isIn(['V1']),
];
