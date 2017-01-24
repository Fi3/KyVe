const test = require('tape');
const Db = require('../Db.js');
const Errors = require('../Errors.js');
const rlp = require('rlp');

function createHeader(head,tail) {
  const buffer = new Buffer.from(Array.from({length: 24}, x => 0)); //jshint ignore:line
  const byteWhereHeadStart = 8;
  const byteWhereTailStart = 16;
  buffer.write('KyVeKyVe', 0, 'ascii');  //magic
  buffer.write(head, byteWhereHeadStart, 'hex');
  buffer.write(tail, byteWhereTailStart, 'hex');
  return buffer;
}

function createNode(data) {
  const collisionFlag = new Buffer(1);
  if (data.collisionFlag === false) {
    collisionFlag.write('00', 0, 'hex');
  }
  else {
    collisionFlag.write('10', 0, 'hex');
  }
  const nextNode = new Buffer(8);
  nextNode.write(data.nextNode, 0, 'hex');
  const key = rlp.encode(data.key);
  const value = rlp.encode(data.value);
  return Buffer.concat([collisionFlag, nextNode, key, value]);
}

test('Db._parseHeader return value', assert => {
  const head = '0000000000005e67';     //24167
  const tail = '0000000005e6774a';     //98989898
  const buffer = createHeader(head, tail);
  const actual = Db._parseHeader(buffer);
  const expected = {'head': 24167, 'tail': 98989898};

  assert.deepEqual(actual, expected,
    'should return head = 24167 and tail 98989898 for the buffer wyth byte 0:8 0000000000005e67 and byte 8:16 0000000005e6774a');
  assert.end();
});

test('Db._parseHeader error throwed for invalid buffer', assert => {
  const buffer = new Buffer(11);
  let actual;
  let expected;
  try {
    Db._parseHeader(buffer);
  }
  catch(e) {
    actual = e.constructor.name;
  }
  try {
    throw new Errors.ParseHeaderInvalidInput();
  }
  catch(e) {
    expected = e.constructor.name;
  }

  assert.deepEqual(actual, expected,
    'if we pass a buffer smaller than 16 byte parseHeader should thorw an ParseHaederInvalidInput error');
  assert.end();
});

test('Db._parseHeader error throwed for invalid buffer', assert => {
  const buffer = new Buffer(24);
  let actual;
  let expected;
  try {
    Db._parseHeader(buffer);
  }
  catch(e) {
    actual = e.constructor.name;
  }
  try {
    throw new Errors.ParseHeaderInvalidInput();
  }
  catch(e) {
    expected = e.constructor.name;
  }

  assert.deepEqual(actual, expected,
    'if we pass without the magic number should thorw an ParseHaederInvalidInput error');
  assert.end();
});

test('Db._parseNode return value', assert => {
  const data = {
    collisionFlag: false,
    nextNode: '000000000004378B', // 276363
    key: 'cane',
    value: 'gatto',
  };
  const buffer = createNode(data);
  const actual = Db._parseNode(buffer, 5);
  data.nextNode = 276363;
  const expected = data;

  assert.deepEqual(actual, expected,
    'should return the encoded data for the buffer, collisionFlag should be bool, nextNode int, key and value string');
  assert.end();
});

test('Db._splitData return value', assert => {
  const data = {
    collisionFlag: false,
    nextNode: '000000000004378B', // 276363
    key: 'cane',
    value: 'gatto',
  };
  const nodes = [];
  for (let x = 0; x < 100; x++) {
    nodes.push(createNode(data));
  }
  const actual = Db._splitData(Buffer.concat(nodes))[54];
  const expected = [nodes[54], 5];

  assert.deepEqual(actual, expected,
    'when we pass a buffer that rapresent x nodes should return an array, returnedArray[n] = [node n, lenght of the key of node n]');
  assert.end();
});

test('Db._splitData return value', assert => {
  const data = {
    collisionFlag: false,
    nextNode: '000000000004378B', // 276363
    key: 'cane',
    value: 'gatto',
  };
  const nodes = [];
  for (let x = 0; x < 100; x++) {
    nodes.push(createNode(data));
  }
  const actual = Db._splitData(Buffer.concat(nodes)).length;
  const expected = 100;

  assert.deepEqual(actual, expected,
    'when we pass a buffer that rapresent 100 nodes should return an array, returnedArray.length should be 100');
  assert.end();
});

//testa per lenght ritorno
