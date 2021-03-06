import check from 'express-validator/check';
import { Error422 } from '../lib/errors/http';

export default (req, res, next) => {
  const errors = check.validationResult(req);
  if (!errors.isEmpty()) {
    return new Error422(
      errors
        .array()
        .map(e => JSON.stringify(e))
        .join()
    ).send(res);
  }
  next();
};
