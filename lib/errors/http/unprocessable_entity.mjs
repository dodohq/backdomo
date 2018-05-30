import HTTPError from './error_template';

/**
 * UnprocessableEntityError 422
 */
export default class UnprocessableEntityError extends HTTPError {
  /**
   * create a new instance of 422 error
   * @param {string} message
   */
  constructor(message) {
    super();
    this.status = 422;
    this.message = message;
  }
}
