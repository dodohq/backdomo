import HTTPError from './error_template';

/**
 * UnauthorizedError 401
 */
export default class UnauthorizedError extends HTTPError {
  /**
   * create a new instance of 401 error
   * @param {string} message
   */
  constructor(message) {
    super();
    this.status = 401;
    this.message = message;
  }
}
