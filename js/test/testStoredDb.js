const test = require('tape');
const fs = require('fs');
const StoredDb = require('../StoredDb.js');
const Errors = require('../Errors.js');
const initStoredDb = require('../utils/initStoredDb.js');

test('StoredDb.slice returned value', assert => {
  const db = new StoredDb.StoredDb('./js/test/testFile', 'node');
  const actual = db.slice(3, 8);
  const expected = Buffer.from('D14B1A7B11', 'hex');

  assert.deepEqual(actual, expected,
    'for start=3 end=4 should return a Buffer that start at file\'s byte 3 at end at file\'s byte 7');
  assert.end();
});


test('StoredDb constructor enviornment not supported', assert => {
  let actual;
  let expected;
  try {
    const db = new StoredDb.StoredDb('./js/test/testFile', 'cordova');
  }
  catch(e) {
    actual = e.constructor.name;
  }
  try {
    throw new Errors.StoredDbNotSupportedEnv();
  }
  catch(e) {
    expected = e.constructor.name;
  }

  assert.deepEqual(actual, expected,
    'when we try to initialize a storedDb for a not supported enviornmet should raise not supp env');
  assert.end();
});

test('StoredDb updateNode action executed', assert => {
  const fakeDumbedDb = new FakeDumpedDb(100);
  const nodePosition = 300;
  const oldValue = Buffer.from('canicanibaubau');
  const newValue = Buffer.from('ciccicicci');
  const key = 'cani';

  const actual = StoredDb._updateNode({_hook: fakeDumbedDb}, nodePosition, key, newValue, oldValue).position;
  const expected = 300 + 24 + 5;

  assert.deepEqual(actual, expected,
    'updateNode should start to write `value` in the file at nodePosition + 24 + keyLen and finish to write at valueLen');
  assert.end();
});

test('StoredDb updateNode error for value to big', assert => {
  const fakeDumbedDb = new FakeDumpedDb(100);
  const nodePosition = 300;
  const oldValue = Buffer.from('canicanibaubau');
  const newValue = Buffer.from('cicciciccicanicanibaubauciccicicci');
  const key = 'cani';

  let actual;
  let expected;
  try {
    StoredDb._updateNode({_hook: fakeDumbedDb}, nodePosition, key, newValue, oldValue);
  }
  catch(e) {
    actual = e.constructor.name;
  }
  try {
    throw new Errors.StoredDbUpdateNodeValueTooLong();
  }
  catch(e) {
    expected = e.constructor.name;
  }

  assert.deepEqual(actual, expected,
    'updateNode should throw StoredDbUpdateNodeValueTooLong when we pass a value that is bigger than nodeLen - 24 - keyLen');
  assert.end();
});

test('StoredDb changeNext action executed', assert => {
  const fakeDumbedDb = new FakeDumpedDb(100);
  const newNextPosition = 40;
  const nodePosition = 15;

  const actual = StoredDb._changeNext({_hook: fakeDumbedDb}, nodePosition, newNextPosition);
  const expected = {data: Buffer.from('0000000000000028', 'hex'), position: nodePosition + 1};

  assert.deepEqual(actual, expected,
    'changeNext should write newNextPosition at position + 1 and should transform newNextPosition in a big endian integer');
  assert.end();
});

test('StoredDb appendNode action executed', assert => {
  const fakeDumbedDb = new FakeDumpedDb(100);
  const node = Buffer.alloc(23);

  const actual = StoredDb._append({_hook: fakeDumbedDb}, node).length;
  const expected = 123;

  assert.deepEqual(actual, expected,
    'appendNode should append the node');
  assert.end();
});

test('StoredDb addNode action executed', assert => {
  const dbLength = 100;
  const fakeDumbedDb = new FakeDumpedDb(dbLength);
  const node = Buffer.alloc(23);
  const previousNodePosition = 14;

  const bufferizedNextPos = Buffer.allocUnsafe(8);
  bufferizedNextPos.writeIntBE(dbLength,0,8);
  const changedNode = {data: bufferizedNextPos, position: previousNodePosition + 1};
  const result = StoredDb._addNode({_hook: fakeDumbedDb}, node, previousNodePosition);

  const actual = {};
  actual.newLength = result.newLength;
  actual.changedNode = result.changedNode;
  actual.newPosition = result.newPosition;
  const expected = {changedNode: changedNode, newLength: 100 + 23, newPosition: 100};

  assert.deepEqual(actual, expected,
    'addNode should append the node and modify the previouse node for point at the appended node newPosition should be the db length before than we add the node');
  assert.end();
});
test('StoredDb addNode action executed for head', assert => {
  const dbLength = 100;
  const fakeDumbedDb = new FakeDumpedDb(dbLength);
  const node = Buffer.alloc(23);
  const previousNodePosition = 0;// if prev position is 0 we are appending the head

  const changedNode = 'head';
  const result = StoredDb._addNode({_hook: fakeDumbedDb}, node, previousNodePosition);

  const actual = {};
  actual.newLength = result.newLength;
  actual.changedNode = result.changedNode;
  actual.newPosition = result.newPosition;
  const expected = {changedNode: changedNode, newLength: 100 + 23, newPosition: 100};

  assert.deepEqual(actual, expected,
    'addNode should append the node and do not modify the previouse node if we add the head newPosition should be the db length before than we add the node');
  assert.end();
});

test('StoredDb updateHead action executed', assert => {
  const dbLength = 100;
  const fakeDumbedDb = new FakeDumpedDb(dbLength);
  const newHeadPosition = Buffer.alloc(8);

  const result = StoredDb._updateHead({_hook: fakeDumbedDb}, newHeadPosition);

  const actual = {};
  actual.newHeadPosition = result.newHeadPosition;
  actual.writePosition = result.writePosition;
  const expected = {newHeadPosition: newHeadPosition, writePosition: 8};

  assert.deepEqual(actual, expected,
    'updateHead should write in the StoredDb the new heade position starting at byte numeber 8');
  assert.end();
});

test('StoredDb updateTail action executed', assert => {
  const dbLength = 100;
  const fakeDumbedDb = new FakeDumpedDb(dbLength);
  const newTailPosition = Buffer.alloc(8);

  const result = StoredDb._updateTail({_hook: fakeDumbedDb}, newTailPosition);

  const actual = {};
  actual.newTailPosition = result.newTailPosition;
  actual.writePosition = result.writePosition;
  const expected = {newTailPosition: newTailPosition, writePosition: 16};

  assert.deepEqual(actual, expected,
    'updateTail should write in the StoredDb the new tail position starting at byte numeber 16');
  assert.end();
});

test('StoredDb init enviornment not supported', assert => {
  let actual;
  let expected;
  try {
    const db = new StoredDb.createStoredDb('./js/test/testFile', 'cordova');
  }
  catch(e) {
    actual = e.constructor.name;
  }
  try {
    throw new Errors.StoredDbNotSupportedEnv();
  }
  catch(e) {
    expected = e.constructor.name;
  }

  assert.deepEqual(actual, expected,
    'when we try to initialize a storedDb for a not supported enviornmet should raise not supp env');
  assert.end();
});

test('StoredDb init action executed', assert => {
  const path = './js/test/initializedFile'
  StoredDb.createStoredDb(path, 'node');
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

class FakeDumpedDb {
  constructor(len) {
    this.fakeDb = Buffer.alloc(len);
  }

  length() {
    return this.fakeDb.length;
  }

  write(data, position) {
    return {data, position};
  }

  append(node) {
    this.fakeDb = Buffer.concat([this.fakeDb, node]);
    return this.fakeDb;
  }
}
