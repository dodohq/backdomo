import jwt from 'jsonwebtoken';

import User from '../database/models/user';
import { Error500, Error409, Error404 } from '../lib/errors/http';

/**
 * UserAPI handling all user related operations
 */
export default class UserAPI {
  /**
   * register new user to the system
   * @param {string} username
   * @param {string} password
   * @param {string} email
   * @param {boolean} isAdmin
   * @param {string} companyID
   * @return {Promise}
   */
  registerNewUser({ username, password, email, isAdmin, companyID }) {
    return new Promise((resolve, reject) =>
      User.findOne({ username })
        .then(u => {
          if (u) reject(new Error409(`Username ${username} taken`));
          return User.findOne({ email });
        })
        .then(u => {
          if (u) reject(new Error409(`Email ${email} taken`));

          const newUser = new User({
            username,
            email,
            is_admin: isAdmin,
            company_id: companyID,
          });
          newUser.password = newUser.encryptPassword(password);
          return newUser.save();
        })
        .then(resolve)
        .catch(e => {
          reject(new Error500(`Internal Server Error: ${JSON.stringify(e)}`));
        })
    );
  }

  /**
   * login details checking, return a jwt
   * @param {string} username
   * @param {string} password
   * @return {string}
   */
  login({ username, password }) {
    return new Promise((resolve, reject) =>
      User.findOne({ username })
        .then(u => {
          if (!u) {
            reject(new Error404(`User ${username} not found`));
          } else if (!u.checkPassword(password, u.password)) {
            reject(new Error401(`Wrong credentials`));
          }

          resolve(
            jwt.sign(u._doc, process.env.JWT_SECRET, { expiresIn: '720h' })
          );
        })
        .catch(e => reject(new Error500(`Internal Server Error: ${e}`)))
    );
  }
}
