const test = require('tape');
const NodeHook = require('../NodeHook.js');
const fs = require('fs');

test('NodeHook._slice returned value', assert => {
  const file = fs.openSync('./js/test/testFile', 'r+');
  const actual = NodeHook._slice({_fileDescriptor: file}, 3, 7);
  const expected = new Buffer('D14B1A7B11', 'hex');

  assert.deepEqual(actual, expected,
    'for start=3 end=4 should return a Buffer that start at file\'s byte 3 at end at file\'s byte 7');
  assert.end();
});
