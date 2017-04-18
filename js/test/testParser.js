const test = require('tape');
const Parser = require('../Parser.js');
const Errors = require('../Errors.js');
const rlp = require('rlp');
const hash = require('fnv1a');

function createHeader(head,tail) {
  const buffer = Buffer.alloc(24); //jshint ignore:line
  const byteWhereHeadPositonStart = 8;
  const byteWhereTailPositonStart = 16;
  buffer.write('KyVeKyVe', 0, 'ascii');  //magic
  buffer.write(head, byteWhereHeadPositonStart, 'hex');
  buffer.write(tail, byteWhereTailPositonStart, 'hex');
  return buffer;
}

function createNode(data) {
  const collisionFlag = Buffer.alloc(1);
  if (data.collisionFlag === 0) {
    collisionFlag.write('00', 0, 'hex');
  }
  else if (data.collisionFlag === 1) {
    collisionFlag.write('10', 0, 'hex');
  }
  else {
    throw UnimplementedError;
  }
  const nextPosition = Buffer.alloc(8);
  nextPosition.write(data.nextPosition, 0, 'hex');
  const key = rlp.encode(data.key);
  const value = rlp.encode(data.value);
  return Buffer.concat([collisionFlag, nextPosition, key, value]);
}

test('Parser._parseHeader return value', assert => {
  const head = '0000000000005e67';     //24167
  const tail = '0000000005e6774a';     //98989898
  const buffer = createHeader(head, tail);
  const actual = Parser._parseHeader(buffer);
  const expected = {'head': 24167, 'tail': 98989898};

  assert.deepEqual(actual, expected,
    'should return head = 24167 and tail 98989898 for the buffer wyth byte 0:8 0000000000005e67 and byte 8:16 0000000005e6774a');
  assert.end();
});

test('Parser._parseHeader error throwed for invalid buffer', assert => {
  const buffer = Buffer.alloc(11);
  let actual;
  let expected;
  try {
    Parser._parseHeader(buffer);
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

test('Parser._parseHeader error throwed for invalid buffer', assert => {
  const buffer = Buffer.alloc(24);
  let actual;
  let expected;
  try {
    Parser._parseHeader(buffer);
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

test('Parser._parseNode return value', assert => {
  const data = {
    collisionFlag: 0,
    nextPosition: '000000000004378B', // 276363
    key: 'cane',
    value: 'gatto',
  };
  const buffer = createNode(data);
  const actual = Parser._parseNode(buffer, 5);
  data.nextPosition = 276363;
  const expected = data;

  assert.deepEqual(actual, expected,
    'should return the encoded data for the buffer, collisionFlag should be bool, nextPosition int, key and value string');
  assert.end();
});

test('Parser._splitData return value', assert => {
  const data = {
    collisionFlag: 0,
    nextPosition: '000000000004378B', // 276363
    key: 'cane',
    value: 'gatto',
  };
  const nodes = [];
  for (let x = 0; x < 100; x++) {
    nodes.push(createNode(data));
  }
  const actual = Parser._splitData(Buffer.concat(nodes))[54];
  const expected = [nodes[54], 5];

  assert.deepEqual(actual, expected,
    'when we pass a buffer that rapresent x nodes should return an array, returnedArray[n] = [node n, length of the key of node n]');
  assert.end();
});

test('Parser._splitData return value', assert => {
  const data = {
    collisionFlag: 0,
    nextPosition: '000000000004378B', // 276363
    key: 'cane',
    value: 'gatto',
  };
  const nodes = [];
  for (let x = 0; x < 100; x++) {
    nodes.push(createNode(data));
  }
  const actual = Parser._splitData(Buffer.concat(nodes)).length;
  const expected = 100;

  assert.deepEqual(actual, expected,
    'when we pass a buffer that rapresent 100 nodes should return an array, returnedArray.length should be 100');
  assert.end();
});

test('Parser._parseNodes return value', assert => {
  const bufferData = db.map(x => [createNode(x), 5]);
  const actual = Parser._parseNodes(bufferData, fakeHash)[1].key;
  const expected = 'cane';

  assert.deepEqual(actual, expected,
    '_parseNodes should return a list with the same nodes that are in the passed data part of StoredParser');
  assert.end();
});

test('Parser._parseNodes return value length', assert => {
  const bufferData = db.map(x => [createNode(x), 5]);
  const actual = Parser._parseNodes(bufferData, fakeHash).length;
  const expected = bufferData.length;

  assert.deepEqual(actual, expected,
    'the len of the returned list should be the same of the passed one');
  assert.end();
});

test('Parser._parseNodes return value position', assert => {
  const bufferData = db.map(x => [createNode(x), 5]);
  const actual = Parser._parseNodes(bufferData, fakeHash)[2].position;
  const expected = 24 + bufferData[0][0].length + bufferData[1][0].length;

  assert.deepEqual(actual, expected,
    '_parseNodes should set the right bytes positions here we have 24 byte of header and 2 nodes of 20 bytes total 64');
  assert.end();
});

test('Parser._toDict return value', assert => {
  const bufferData = db.map(x => [createNode(x), 5]);
  const nodeArray = Parser._parseNodes(bufferData, fakeHash);
  const actual = Parser._toDict(nodeArray).lupi.value;
  const expected = 'patti';

  assert.deepEqual(actual, expected,
    '_toDict should return a dict with the same nodes that are in the passed array of nodes');
  assert.end();
});

test('Parser._setIndexes return value', assert => {
  const actual = Parser._setIndexes(db, fakeHash).filter(node => node.key === 'cant' && node.collisionFlag === 0)[0].index;
  const expected = 2;

  assert.deepEqual(actual, expected,
    '_setIndexes should return an array of nodes each node.index should be the absolute position of hash(node.key) respect to the other nodes');
  assert.end();
});

test('Parser._setIndexes return value for node with collision flag true', assert => {
  const actual = Parser._setIndexes(db, fakeHash).filter(node => node.collisionFlag === 1)[0].index;
  const expected = 3;

  assert.deepEqual(actual, expected,
    '_setIndexes should return an array of nodes each node.index should be the absolute position of hash(node.key) respect to the other nodes');
  assert.end();
});

test('Parser._setKeys returned value tail', assert => {
  const actual = Parser._setKeys(Parser._setIndexes(db, fakeHash), fakeHash).filter(node => node.index === 3)[0].nextKey;
  const expected = 'lupi';

  assert.deepEqual(actual, expected,
    '_setKeys should return an array of nodes, the node with the biggest index (tail) should have key === nextKey');
  assert.end();
});

test('Parser._setKeys returned value head', assert => {
  const actual = Parser._setKeys(Parser._setIndexes(db, fakeHash), fakeHash).filter(node => node.index === 1)[0].previousKey;
  const expected = 'pani';

  assert.deepEqual(actual, expected,
    '_setKeys should return an array of nodes, the node with the smallest index (head) should have key === previousKey');
  assert.end();
});

test('Parser._setKeys returned value head', assert => {
  const actual = Parser._setKeys(Parser._setIndexes(db, fakeHash), fakeHash).filter(node => node.index === 1)[0].previuosActualIndex;
  const expected = 0;

  assert.deepEqual(actual, expected,
    '_setKeys should return an array of nodes, the node with the smallest index (head) should have previousActualIndex === 0');
  assert.end();
});

test('Parser.memoryDbFromStoredDb return value', assert => {
  const head = '0000000000000052';     // 82
  const tail = '0000000000000068';     // 104
  const bufferHeader = createHeader(head, tail);
  const bufferData = Buffer.concat(db.map(x => createNode(x)));
  const storedDb = Buffer.concat([bufferHeader, bufferData]);
  const actual = Parser.memoryDbFromStoredDb(storedDb, fakeHash).get('cane');
  const expected = 'gatti';

  assert.deepEqual(actual, expected,
    'memoryDbFromStoredDb should return a MemoryParser with the same nodes that are in the passed StoredParser');
  assert.end();
});

test('Parser._addNormalizedIndexes return value', assert => {
  const actual = Parser._addNormalizedIndexes([{},{},{}]);
  const expected = 
    [
      {normalizedIndex: 1}
    , {normalizedIndex: 2}
    , {normalizedIndex: 3}
    ];

  assert.deepEqual(actual, expected,
    '_addNormalizedIndexes should return a list with a field added in each element the filed name should be normalizedIndex and the filed value should be the element index in the list + 1');
  assert.end();
});

test('Parser._addPreviousKeys return value', assert => {
  const actual = Parser._addPreviousKeys([{key:'cane'},{key:'cani'},{key:'cana'}]);
  const expected = 
    [
      {previousKey: 'cane', key: 'cane'}
    , {previousKey: 'cane', key: 'cani'}
    , {previousKey: 'cani', key: 'cana'}
    ];

  assert.deepEqual(actual, expected,
    '_addPreviousKeys should return a list with a field added in each element the filed name should be PreviousKey the filed value should be the key filed at arr[index - 1] if index is 0 should be arr[index].key');
  assert.end();
});

test('Parser._addNextKeys return value', assert => {
  const actual = Parser._addNextKeys([{key:'cane'},{key:'cani'},{key:'cana'}]);
  const expected = 
    [
      {nextKey: 'cani', key: 'cane'}
    , {nextKey: 'cana', key: 'cani'}
    , {nextKey: 'tail', key: 'cana'}
    ];

  assert.deepEqual(actual, expected,
    '_addNextKeys should return a list with a field added in each element the filed name should be nextKey the filed value should be the key fild at arr[index + 1] if index is arr.len should be "tail"');
  assert.end();
});

test('Parser._prevActIndexes return value', assert => {
  const actual = Parser._addPrevActIndexes([ 
      {previousKey:'pani'}
    , {previousKey:'cane'}
    , {previousKey:'lupi'}], fakeHash);
  const expected = 
    [
      {previousActualIndex: 236, previousKey: 'pani'}
    , {previousActualIndex: 543, previousKey: 'cane'}
    , {previousActualIndex: 1000, previousKey: 'lupi'}
    ];

  assert.deepEqual(actual, expected,
    '_addPrevActIndexes should return a list with a field added in each element the filed name should be previousActualIndex the filed value should hash(prevKey)');
  assert.end();
});

test('Parser._getHeader return value', assert => {
  const header = {head: 24, tail: 32};
  const nodes =
    { cane : {position: 24, value: 'value1'}
    , cani : {position: 87, value: 'value2'}
    , cana : {position: 32, value: 'value3'}
    }
  const actual = Parser._getHeader(header, nodes);
  const expected = 
    { head: {node: nodes.cane, key: 'cane'}
    , tail: {node: nodes.cana, key: 'cana'}
    }

  assert.deepEqual(actual, expected,
    'getHeader should return an object {head: {node, key}, tail{node, key}');
  assert.end();
});

function fakeHash(key) {
  const map = {pani: 236, cane: 543, lupi: 1000, cant: 543};
  return map[key];
}

const db = [
  {
    // THIS IS THE II ELEMENT
    collisionFlag: 0,
    nextPosition: '0000000000000026', // 38
    key: 'cant',
    value: 'gatto',
  },
  {
    // THIS IS THE III ELEMENTindex
    collisionFlag: 1,
    nextPosition: '000000000000003c', // 60
    key: 'cane',
    value: 'gatti',
  },
  {
    // THIS IS THE HEAD
    collisionFlag: 0,
    nextPosition: '0000000000000052', // 82
    key: 'pani',
    value: 'matti',
  },
  {
    // THIS IS THE TAIL
    collisionFlag: 0,
    nextPosition: '0000000000000068', // 104
    key: 'lupi',
    value: 'patti',
  },
];

