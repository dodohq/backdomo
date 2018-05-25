import check from 'express-validator/check';

const { body } = check;

export const USERNAME = [
  body('username').exists(),
  body('username').isLength({ min: 1 }),
];

export const PASSWORD = [
  body('password').exists(),
  body('password').isLength({ min: 8 }),
];

export const EMAIL = [body('email').exists(), body('email').isEmail()];
