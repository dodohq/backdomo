import querystring from 'querystring';

/**
 * parse params in url
 * @param {string} url
 * @return {object}
 */
export default url => {
  const urlParts = url.split('?');
  const params = urlParts[urlParts.length - 1];

  return querystring.parse(params);
};
