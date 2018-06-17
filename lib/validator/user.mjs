import check from 'express-validator/check';

const { body } = check;

export const ID = [body('id').exists(), body('id').isString()];

export const USERNAME = [
  body('username').exists(),
  body('username').isLength({ min: 1 }),
];
export const USERNAME_OPTIONAL = [
  body('username')
    .optional()
    .isLength({ min: 1 }),
];

export const PASSWORD = [
  body('password').exists(),
  body('password').isLength({ min: 8 }),
];
export const PASSWORD_OPTIONAL = [
  body('password')
    .optional()
    .isLength({ min: 8 }),
];
export const OLD_PASSWORD = [
  body('old_password').exists(),
  body('old_password').isLength({ min: 8 }),
];

export const EMAIL = [body('email').exists(), body('email').isEmail()];
export const EMAIL_OPTIONAL = [
  body('email')
    .optional()
    .isEmail(),
];

export const ROLE = [body('is_admin').exists(), body('is_admin').isBoolean()];
export const ROLE_OPTIONAL = [
  body('is_admin')
    .optional()
    .isBoolean(),
];

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
