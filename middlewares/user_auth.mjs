import jwt from 'jsonwebtoken';
import { Error401, Error500 } from '../lib/errors/http';

/**
 * roles constant enum
 * @enum {string}
 */
export const roles = {
  ADMIN: 'admin',
  USER: 'user',
  ROBOT: 'robot',
};

/**
 * AuthForRole middleware function generator
 */
export class AuthForRole {
  /**
   * create new instance of authentication middleware
   * @param {roles} role
   */
  constructor(role) {
    this.role = role;
    this.check = this.check.bind(this);
  }

  /**
   * check actual middleware function
   * @param {express.req} req
   * @param {express.res} res
   * @param {Function} next
   * @return {null}
   */
  check(req, res, next) {
    const token = req.get('Authorization') || req.body.token || req.query.token;
    if (!token) return new Error401('No Token Found').send(res);

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return new Error500(err.message).send(res);
      if (this.role === roles.ROBOT) {
        // no expiry for robot token
        decoded.exp = Infinity;
      }
      if (decoded.exp <= Date.now() / 1000) {
        return new Error401('Token Expired').send(res);
      }
      if (this.role === roles.ADMIN && !decoded.is_admin) {
        return new Error401('No Admin Access').send(res);
      }

      req.user = decoded;
      next();
    });
  }
}
