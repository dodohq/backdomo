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

export const ROLE = [body('is_admin').exists(), body('is_admin').isBoolean()];

export const COMPANY_ID = [
  body('company_id').custom(
    (value, { req }) =>
      new Promise((resolve, reject) => {
        if (!value && !req.body.is_admin) {
          reject(new Error('Company ID must be provided for non-admin users'));
        } else {
          resolve();
        }
      })
  ),
];
