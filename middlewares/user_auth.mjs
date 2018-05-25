import jwt from 'jsonwebtoken';
import { Error401, Error500 } from '../lib/errors/http';

export const check = (req, res, next) => {
  const token = req.get('Authorization') || req.body.token || req.query.token;
  if (!token) return new Error401('No Token Found').send(res);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return new Error500(err.message).send(res);
    if (decoded.exp >= Date.now() / 1000) {
      return new Error401('Token Expired').send(res);
    }

    req.user = decoded;
    next();
  });
};
