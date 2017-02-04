const test = require('tape');
const NodeHook = require('../NodeHook.js');
const fs = require('fs');

test('NodeHook slice returned value', assert => {
  const file = fs.openSync('./js/test/testFile', 'r+');
  const actual = NodeHook._slice({_fileDescriptor: file}, 3, 7);
  const expected = Buffer.from('D14B1A7B11', 'hex');
  fs.closeSync(file);

  assert.deepEqual(actual, expected,
    'for start=3 end=4 should return a Buffer that start at file\'s byte 3 at end at file\'s byte 7');
  assert.end();
});

test('NodeHook write action executed', assert => {
  const file = fs.openSync('./js/test/testFile2', 'r+');
  const len = 100; // is len in byte of testFile2
  NodeHook._write({_fileDescriptor: file}, Buffer.from('canocani', 'ascii'), 7);
  const actual = NodeHook._slice({_fileDescriptor: file}, 7, 7 + 'canocani'.length - 1);
  const expected = Buffer.from('canocani', 'ascii');
  fs.writeSync(file, new Buffer.alloc(len), 0, len, 0);
  fs.closeSync(file);

  assert.deepEqual(actual, expected,
    'write should write buffer at position');
  assert.end();
});
