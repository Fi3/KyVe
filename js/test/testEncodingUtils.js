const test = require('tape');
const EncodingUtils = require('../EncodingUtils.js');
const Errors = require('../Errors.js');

test('*getRLPLen returned values for input < 128', assert => {
  const actual = EncodingUtils.getRLPLen(getRandomInt(0,128)).next();
  const expected = {value:1, done:true};

  assert.deepEqual(actual, expected,
    '*getRLPLen should return 1 for int between 0 included and 128 excluded');
  assert.end();
});

test('*getRLPLen returned values for 127<input>184', assert => {
  const firstByte = getRandomInt(128, 184);
  const actual = EncodingUtils.getRLPLen(firstByte).next();
  const expected = {value: firstByte - 128 + 1, done:true};

  assert.deepEqual(actual, expected,
    '*getRLPLen should return firstByte - 128 + 1 for int between 128 included and 256 excluded');
  assert.end();
});

test('*getRLPLen returned values for 182<input>192', assert => {
  const firstByte = getRandomInt(183, 192);
  const actual = EncodingUtils.getRLPLen(firstByte).next();
  const expected = {value: firstByte - 183 + 1, done:false};

  assert.deepEqual(actual, expected,
    'done should be false and *getRLPLen should ask for other x bytes with x = firstByte - 183 + 1 for int between 183 included and 192 excluded');
  assert.end();
});


test('*getRLPLen returned value for 182<input>192 at second call', assert => {
  const len = EncodingUtils.getRLPLen(185);
  len.next();
  const actual = len.next(new Buffer([0x03, 0xe8]));
  const expected = {value: 1000, done:true};

  assert.deepEqual(actual, expected,
    '*getRLPLen should return 1000 if the first call is 0x185 and the second call is [0x03, 0xe8]');
  assert.end();
});

function getRandomInt(min, max) {
  // Returns a random integer between min (included) and max (excluded)
  // Using Math.round() will give you a non-uniform distribution!
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
