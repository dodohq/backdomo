import express from 'express';

import UserAPI from '../../api/user';
import * as userValidator from '../../lib/validator/user';
import { Error401 } from '../../lib/errors/http';
import { AuthForRole, roles } from '../../middlewares/user_auth';
import valErrHandler from '../../middlewares/validator_error_handler';
import genericErrHandler from '../../lib/utils/http_generic_err_handler';

const router = express.Router(); // eslint-disable-line new-cap
const userApi = new UserAPI();
const adminAuth = new AuthForRole(roles.ADMIN);
const userAuth = new AuthForRole(roles.USER);

router.get('/', adminAuth.check, (req, res) => {
  userApi
    .queryAllUsers()
    .then(users => res.status(200).json({ users }))
    .catch(e => genericErrHandler(e, res));
});

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

router.put(
  '/',
  adminAuth.check,
  [
    userValidator.ID,
    userValidator.USERNAME_OPTIONAL,
    userValidator.EMAIL_OPTIONAL,
    userValidator.ROLE_OPTIONAL,
    userValidator.PASSWORD_OPTIONAL,
    userValidator.COMPANY_ID,
  ],
  valErrHandler,
  (req, res) => {
    const {
      id,
      username,
      email,
      is_admin: isAdmin,
      password,
      company_id: companyID,
    } = req.body;

    userApi
      .editUserDetails({ id, email, username, isAdmin, password, companyID })
      .then(u => res.status(200).json(u))
      .catch(e => genericErrHandler(e, res));
  }
);

router.post(
  '/change_password',
  userAuth.check,
  [userValidator.OLD_PASSWORD, userValidator.PASSWORD],
  valErrHandler,
  (req, res) => {
    const { old_password: oldPassword, password } = req.body;
    const { _id: id } = req.user;

    userApi
      .queryUserByID({ id })
      .then(u => {
        if (!u.checkPassword(oldPassword, u.password)) {
          throw new Error401(`Wrong old password`);
        }

        return userApi.editUserDetails({ password, id });
      })
      .then(u => res.status(200).json(u))
      .catch(e => genericErrHandler(e, res));
  }
);

router.delete('/:id', adminAuth.check, (req, res) => {
  const { id } = req.params;

  userApi
    .deleteUserByID({ id })
    .then(() => res.status(200).json({}))
    .catch(e => genericErrHandler(e, res));
});

export default router;
