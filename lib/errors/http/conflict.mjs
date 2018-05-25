import HTTPError from './error_template';

/**
 * ConflictError 409
 */
export default class ConflictError extends HTTPError {
  /**
   * create a new instance of conflict error
   * @param {string} message
   */
  constructor(message) {
    super();
    this.status = 409;
    this.message = message;
  }
}
