import jwt from 'jsonwebtoken';
import { Error401, Error500 } from '../lib/errors/http';

/**
 * RobotAuth middleware robot auth generator
 */
export default class RobotAuth {
  /**
   * actual middleware function
   * @param {express.req} req
   * @param {express.res} res
   * @param {Function} next
   * @return {Promise}
   */
  check(req, res, next) {
    const token = req.get('Authorization') || req.body.token || req.query.token;
    if (!token) return new Error401('No Token Found').send(res);

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return new Error500(err.message).send(res);
      if (!decoded.is_robot) {
        return new Error401('Invalid robot authentication token').send(res);
      }

      req.robot = decoded;
      next();
    });
  }
}
