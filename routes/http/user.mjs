import express from 'express';

import UserAPI from '../../api/user';
import * as userValidator from '../../lib/validator/user';
import * as userAuth from '../../middlewares/user_auth';

const router = express.Router(); // eslint-disable-line new-cap
const userApi = new UserAPI();

router.post(
  '/register',
  userAuth.check,
  [userValidator.USERNAME, userValidator.PASSWORD, userValidator.EMAIL],
  (req, res) => {
    const { username, password, email } = req.body;
    userApi
      .registerNewUser({ username, password, email })
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
