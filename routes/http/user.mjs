import express from 'express';

import UserAPI from '../../api/user';
import * as userValidator from '../../lib/validator/user';
import { AuthForRole, roles } from '../../middlewares/user_auth';
import valErrHandler from '../../middlewares/validator_error_handler';

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
  ],
  valErrHandler,
  (req, res) => {
    // eslint-disable-next-line camelcase
    const { username, password, email, is_admin } = req.body;
    userApi
      .registerNewUser({ username, password, email, isAdmin: is_admin })
      .then(user => {
        res.status(201).json({ user });
      })
      .catch(e => {
        if (e.send) return e.send(res);
        res.status(500).json({ message: `Error: ${e}` });
      });
  }
);
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  userApi
    .login({ username, password })
    .then(token => {
      res.status(200).json({ token });
    })
    .catch(e => {
      if (e.send) return e.send(res);
      res.status(500).json({ message: `Error: ${e}` });
    });
});

export default router;
