import check from 'express-validator/check';

const { body, buildCheckFunction } = check;
const fullCustomCheck = buildCheckFunction([])().custom;

export const COMPANY_ID = [
  fullCustomCheck(
    (value, { req }) =>
      new Promise((resolve, reject) => {
        if (!req.user.company_id) {
          reject(new Error('No Company ID provided'));
        } else if (
          typeof req.user.company_id !== 'string' ||
          req.user.company_id.length === 0
        ) {
          reject(new Error('Invalid Company ID'));
        } else {
          resolve();
        }
      })
  ),
];

export const ADDRESS = [
  body('address').exists(),
  body('address').isLength({ min: 1 }),
];
export const ADDRESS_OPTIONAL = [
  body('address')
    .optional()
    .isLength({ min: 1 }),
];

export const DATE_OF_DELIVERY = [
  body('date_of_delivery').exists(),
  body('date_of_delivery').isLength({ min: 10 }),
];
export const DATE_OF_DELIVERY_OPTIONAL = [
  body('date_of_delivery')
    .optional()
    .isLength({ min: 10 }),
];

export const CUSTOMER_CONTACT = [
  body('customer_contact').exists(),
  body('customer_contact').isLength({ min: 1 }),
];
export const CUSTOMER_CONTACT_OPTIONAL = [
  body('customer_contact')
    .optional()
    .isLength({ min: 1 }),
];

export const ROBOT_ID = [
  fullCustomCheck(
    (value, { req }) =>
      new Promise((resolve, reject) => {
        if (!req.robot._id) {
          reject(new Error('No Robot ID provided'));
        } else if (
          typeof req.robot._id !== 'string' ||
          req.robot._id.length === 0
        ) {
          reject(new Error('Invalid Robot ID'));
        } else {
          resolve();
        }
      })
  ),
];

export const ROBOT_COMPARTMENT = [
  body('robot_compartment').exists(),
  body('robot_compartment').isLength({ min: 1 }),
];

export const ID = [body('id').exists(), body('id').isLength({ min: 1 })];

export const PASSWORD = [
  body('password').exists(),
  body('password').isLength(6),
];

export const UUID = [body('uuid').exists(), body('uuid').isLength(3)];
