import jwt from 'jsonwebtoken';

import User from '../database/models/user';
import { Error500, Error409, Error404, Error401 } from '../lib/errors/http';

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

          resolve({
            token: jwt.sign(u._doc, process.env.JWT_SECRET, {
              expiresIn: '720h',
            }),
            is_admin: u.is_admin,
          });
        })
        .catch(e => reject(new Error500(`Internal Server Error: ${e}`)))
    );
  }

  /**
   * get all users in database
   * @return {Promise}
   */
  queryAllUsers() {
    return User.find({}).catch(e =>
      reject(new Error500(`Internal Server Error: ${e}`))
    );
  }

  /**
   * get an user by ID
   * @param {string} id
   * @return {Promise}
   */
  queryUserByID({ id }) {
    return User.findById(id)
      .then(u => {
        if (!u) throw new Error404(`User with ID ${id} doesnt exist`);

        return u;
      })
      .catch(e => reject(new Error500(`Internal Server Error: ${e}`)));
  }

  /**
   * edit details of an user
   * @param {string} id
   * @param {string} email
   * @param {string} password
   * @param {string} companyID
   * @return {Promise}
   */
  editUserDetails({ id, email, isAdmin, password, companyID }) {
    return User.findById(id)
      .then(u => {
        if (!u) throw new Error404(`User with ID ${id} not found`);

        if (email) u.email = email;
        if (isAdmin !== undefined) {
          u.is_admin = isAdmin;
          if (isAdmin && isAdmin !== 'false') {
            u.company_id = null;
            companyID = null;
          }
        }
        if (password) u.password = u.encryptPassword(password);
        if (companyID) u.company_id = companyID;

        return u.save();
      })
      .catch(e => {
        throw new Error500(`Internal Server Error: ${e}`);
      });
  }

  /**
   * Delete user record from db
   * @param {string} id
   * @return {Promise}
   */
  deleteUserByID({ id }) {
    return User.findByIdAndDelete(id).catch(e =>
      reject(new Error500(`Internal Server Error: ${e}`))
    );
  }
}
