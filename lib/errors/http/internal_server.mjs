import HTTPError from './error_template';

/**
 * InternalServerError 500
 */
export default class InternalServerError extends HTTPError {
  /**
   * create new instance of this error
   * @param {string} message
   */
  constructor(message) {
    super();
    this.message = message;
    this.status = 500;
    this.send = this.send.bind(this);
  }
}
