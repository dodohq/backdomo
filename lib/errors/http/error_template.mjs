/**
 * template for HTTP Errors
 */
export default class HTTPError {
  /**
   * send error down through express response object
   * @param {express.res} res
   */
  send(res) {
    res.status(this.status).json({ message: this.message });
  }
}
