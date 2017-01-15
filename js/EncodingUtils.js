const Errors = require('./Errors.js');

function *getRLPLen(firstByte) {
  // take the first byte of an RLP encoded string, and return the len of the string or ask for more information
  if (firstByte >= 0 && firstByte < 128) {
    return 1;
  }
  if (firstByte >= 128 && firstByte < 184) {
    return firstByte - 128 + 1;
  }
  if (firstByte >= 183 && firstByte < 192) {
    const len = yield firstByte - 183 + 1;
    return len.readIntBE(0, len.length);
  }
  if (firstByte >= 192) {
    throw new Errors.GetRLPLenInvalidInput('ARRAY NOT SUPPORTED');
  }
  throw new Error();
}

module.exports.getRLPLen = getRLPLen;
