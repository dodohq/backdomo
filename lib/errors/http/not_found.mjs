import HTTPError from './error_template';

/**
 * NotFoundError 404
 */
export default class NotFoundError extends HTTPError {
  /**
   * create new instance of 404 error
   * @param {string} message
   */
  constructor(message) {
    super();
    this.status = 404;
    this.message = message;
  }
}
