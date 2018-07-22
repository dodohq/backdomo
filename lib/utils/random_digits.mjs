/**
 * randomly genereate a 6 digits string
 * @param {integer} numberOfDigits
 * @return {string}
 */
export default numberOfDigits => {
  if (numberOfDigits < 1) {
    throw new Error('Invalid string length');
  }
  const min = Math.pow(10, numberOfDigits - 1);
  const max = Math.pow(10, numberOfDigits);

  return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
};
