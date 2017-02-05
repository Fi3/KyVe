const test = require('tape');
const NodeHook = require('../NodeHook.js');
const fs = require('fs');
const initStoredDb = require('../utils/initStoredDb.js');

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

test('NodeHook length returned value', assert => {
  const len = 100;
  const actual = NodeHook._length({_path: './js/test/testFile'});
  const expected = len;

  assert.deepEqual(actual, expected,
    'len should return the StoredDb\'s length in bytes');
  assert.end();
});

test('NodeHook append action executed', assert => {
  const path = './js/test/testFile3'
  const file = fs.openSync(path, 'r+');
  const initialLen = 100; // is len in byte of testFile2
  NodeHook._append({_fileDescriptor: file, _length: function(x){return 100}}, Buffer.allocUnsafe(10));
  const actual = fs.statSync(path).size;
  const expected = 100 + 10;
  fs.truncate(path, 100);
  fs.closeSync(file);

  assert.deepEqual(actual, expected,
    'After append the file\' size should be original file\'s size + buffer.length');
  assert.end();
});

test('NodeHook append action executed', assert => {
  const path = './js/test/testFile3'
  const file = fs.openSync(path, 'r+');
  const initialLen = 100; // is len in byte of testFile2
  const appendedBuffer = Buffer.allocUnsafe(10);
  NodeHook._append({_fileDescriptor: file, _length: function(x){return 100}}, appendedBuffer);
  const actual = NodeHook._slice ({_fileDescriptor: file}, 100, 100 + 10 - 1);
  const expected = appendedBuffer;
  fs.truncate(path, 100);
  fs.closeSync(file);

  assert.deepEqual(actual, expected,
    'After append the the end of the file should contain the appended buffer');
  assert.end();
});

test('NodeHook init action executed', assert => {
  const path = './js/test/initializedFile'
  NodeHook.init(path);
  const file = fs.openSync(path, 'r');
  const data = Buffer.alloc(84);
  fs.readSync(file, data, 0, 84, 0);

  const actual = data.length;
  const expected = initStoredDb.initializedDb.length;
  fs.closeSync(file);
  fs.unlinkSync(path);

  assert.deepEqual(actual, expected,
    'Init should create a new file that contain just the header and three nodes');
  assert.end();
});
