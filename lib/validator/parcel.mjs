import check from 'express-validator/check';

const { body, buildCheckFunction } = check;
const fullCustomCheck = buildCheckFunction([])();

export const COMPANY_ID = [
  fullCustomCheck.custom(
    (value, { req }) =>
      new Promise((resolve, reject) => {
        if (!req.user.company_id) {
          reject(new Error('No Company ID provided'));
        } else if (
          typeof req.user.company_id === 'string' &&
          req.user.company_id.length > 0
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

export const DATE_OF_DELIVERY = [
  body('date_of_delivery').exists(),
  body('date_of_delivery').isLength({ min: 10 }),
];

export const CUSTOMER_CONTACT = [
  body('customer_contact').exists(),
  body('customer_contact').isLength({ min: 1 }),
];
