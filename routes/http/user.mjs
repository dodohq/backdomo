import express from 'express';

import UserAPI from '../../api/user';
import * as userValidator from '../../lib/validator/user';
import { AuthForRole, roles } from '../../middlewares/user_auth';
import valErrHandler from '../../middlewares/validator_error_handler';
import genericErrHandler from '../../lib/utils/http_generic_err_handler';

const router = express.Router(); // eslint-disable-line new-cap
const userApi = new UserAPI();
const adminAuth = new AuthForRole(roles.ADMIN);

router.post(
  '/register',
  adminAuth.check,
  [
    userValidator.USERNAME,
    userValidator.PASSWORD,
    userValidator.EMAIL,
    userValidator.ROLE,
    userValidator.COMPANY_ID,
  ],
  valErrHandler,
  (req, res) => {
    // eslint-disable-next-line camelcase
    const { username, password, email, is_admin, company_id } = req.body;
    userApi
      .registerNewUser({
        username,
        password,
        email,
        isAdmin: is_admin,
        companyID: company_id,
      })
      .then(user => {
        res.status(201).json({ user });
      })
      .catch(e => genericErrHandler(e, res));
  }
);

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  userApi
    .login({ username, password })
    .then(details => {
      res.status(200).json(details);
    })
    .catch(e => genericErrHandler(e, res));
});

export default router;
