const test = require('tape');
const Db = require('../MemoryDb.js');
const Errors = require('../Errors.js');

test('Db._getPreviousNode returned value for key not in db', assert => {
  const actual = Db._getPreviousNode(memoryDb, 'cani');
  const expected = memoryDb._nodes.ciay;

  assert.deepEqual(actual, expected,
    'should return the biggest index that is smaller than hash(key)');
  assert.end();
});

test('Db._getPreviousNode returned value for key in db', assert => {
  const actual = Db._getPreviousNode(memoryDb, 'ciay');
  const expected = memoryDb._nodes.ciar;

  assert.deepEqual(actual, expected,
    'should return the biggest index that is smaller than hash(key)');
  assert.end();
});

test('Db._getPreviousNode returned value for the  smallest hash(key)', assert => {
  const actual = Db._getPreviousNode(memoryDb, 'rrrr');
  const expected = 'head';

  assert.deepEqual(actual, expected,
    'should return 0 if the index is smaller than all the other in the db');
  assert.end();
});

test('Db._getPreviousNode returned value for the biggets hash(key)', assert => {
  const actual = Db._getPreviousNode(memoryDb, 'kkkk');
  const expected = memoryDb._nodes.cias;

  assert.deepEqual(actual, expected,
    'should return the last index when we pass an index thah is bigger than all the other in the db');
  assert.end();
});

test('Db._traverseBoucket returned value for the first element of a boucket', assert => {
  const actual = Db._traverseBoucket(memoryDb, memoryDb._nodes.ciar);
  const expected = [memoryDb._nodes.ciar, memoryDb._nodes.ciat];

  assert.deepEqual(actual, expected,
    'when we pass the first element of a boucket should return the whole boucket');
  assert.end();
});

test('Db._traverseBoucket returned value for a key that is not in a boucket', assert => {
  let actual;
  let expected;
  try {
    Db._traverseBoucket(memoryDb, memoryDb._nodes.cias);
  }
  catch(e) {
    actual = e.constructor.name;
  }
  try {
    throw new Errors.MemoryDbKeyNotInBoucket();
  }
  catch(e) {
    expected = e.constructor.name;
  }

  assert.deepEqual(actual, expected,
    'when we pass a key taht is not in boucket _traverseBoucket should raise NotInBoucket');
  assert.end();
});

test('Db._traverseBoucket returned value for a key that is in a boucket but is not the first elements', assert => {
  let actual;
  let expected;
  try {
    Db._traverseBoucket(memoryDb, memoryDb._nodes.ciat);
  }
  catch(e) {
    actual = e.constructor.name;
  }
  try {
    throw new Errors.MemoryDbKeyNotFirstInBoucket();
  }
  catch(e) {
    expected = e.constructor.name;
  }

  assert.deepEqual(actual, expected,
    'when we pass a key that is in a boucket but is not the first element should raise NotFirstElement');
  assert.end();
});

test('Db.inspect returned value for key not in DB', assert => {
  const actual = Db._inspect(memoryDb, 'cani');
  const expected = {
    normalizedIndex: 4,
    previousNodePosition: 600,
    nextNodePosition: 700,
    alreadyInDb: false,
    collisions:0
  };

  assert.deepEqual(actual, expected,
    'previousIndexPosition should be the position of the node at the index before the index of the key ' +
    'nextNodePosition should be the position of the node at the index after the index of the key ' +
    'alreadyInDb should be false for key not presented in db ' +
    'collisions should be 0 for key not presented in db');
  assert.end();
});

test('Db.inspect returned value for key in DB', assert => {
  const actual = Db._inspect(memoryDb, 'ciau');
  const expected = {
    normalizedIndex: 4,
    previousNodePosition: 600,
    nextNodePosition: 100,
    alreadyInDb: true,
    collisions:0
  };

  assert.deepEqual(actual, expected,
    'previousIndexPosition should be the position of the node at the index before the index of the key ' +
    'nextNodePosition should be the position of the node at the index after the index of the key ' +
    'alreadyInDb should be true for key  presented in db ' +
    'collisions should be 0 for key already in db');
  assert.end();
});

test('Db.inspect returned value when previus index contain more than one node (collision)', assert => {
  const actual = Db._inspect(memoryDb, 'ciay');
  const expected = {
    normalizedIndex: 3,
    previousNodePosition: 500,
    nextNodePosition: 700,
    alreadyInDb: true,
    collisions:0
  };

  assert.deepEqual(actual, expected,
    'previousIndexPosition should be the position of the node at the index before the index of the key ' +
    'nextNodePosition should be the position of the node at the index after the index of the key in (last element of boucket)' +
    'alreadyInDb should be true for key presented in db ' +
    'collisions should be 0 for key not presented in db');
  assert.end();
});

test('Db.inspect returned value for key not in db but with a collision', assert => {
  const actual = Db._inspect(memoryDb, 'tttt');
  const expected = {
    normalizedIndex: 3,
    previousNodePosition: 500,
    nextNodePosition: 600,
    alreadyInDb: false,
    collisions:1
  };

  assert.deepEqual(actual, expected,
    'previousIndexPosition should be the position of the node at the index before the index of the key ' +
    'nextNodePosition should be the position of the node at the index after the index of the key in (first element of boucket)' +
    'alreadyInDb should be false for key not presented in db ' +
    'collisions should be bigger 0 for key that collide');
  assert.end();
});

test('Db.inspect returned value for key  in db and with a collision', assert => {
  const actual = Db._inspect(memoryDb, 'ciat');
  const expected = {
    normalizedIndex: 2,
    previousNodePosition: 400,
    nextNodePosition: 600,
    alreadyInDb: true,
    collisions:1
  };

  assert.deepEqual(actual, expected,
    'previousIndexPosition should be the position of the node at the index before the index of the key ' +
    'nextNodePosition should be the position of the node at the index after the index of the key in (last element of boucket)' +
    'alreadyInDb should be true for key presented in db ' +
    'collisions should be < 0 for key that collide');
  assert.end();
});

test('Db updateNode returned value', assert => {
  const mDb = new Db.MemoryDb(memoryDb._header, memoryDb._nodes, memoryDb._hashFunction);
  const actual = Db._updateNode(mDb, 'ciay', 'cane').get('ciay');
  const expected = 'cane';

  assert.deepEqual(actual, expected,
    'should change the old value with the new one');
  assert.end();
});

test('Db updateNode raise for key not in db', assert => {
  const mDb = new Db.MemoryDb(memoryDb._header, memoryDb._nodes, memoryDb._hashFunction);
  let actual;
  let expected;
  try {
    Db._updateNode(mDb, 'grulli', 'mangia');
  }
  catch(e) {
    actual = e.constructor.name;
  }
  try {
    throw new Errors.MemoryDbKeyNotInDb();
  }
  catch(e) {
    expected = e.constructor.name;
  }

  assert.deepEqual(actual, expected,
    'when we pass a key taht is not in the db should rais keyNotInDb');
  assert.end();
});

test('Db updateNode raise for value too long', assert => {
  const mDb = new Db.MemoryDb(memoryDb._header, memoryDb._nodes, memoryDb._hashFunction);
  let actual;
  let expected;
  try {
    Db._updateNode(mDb, 'ciay', 'mangiamangiamangiamangiamangia');
  }
  catch(e) {
    actual = e.constructor.name;
  }
  try {
    throw new Errors.MemoryDbValueTooLong();
  }
  catch(e) {
    expected = e.constructor.name;
  }

  assert.deepEqual(actual, expected,
    'when we try to update a node with a value that is bigger than the old one should raise valueTooLong');
  assert.end();
});

test('Db addNode returned value', assert => {
  const newNode = {
    collisionFlag: 0,
    nextPosition: 700,
    value: 'canicanibaubau',
    position: 600,
    normalizedIndex: 3,
    previousKey: 'ciat',
    nextKey: 'ciau',
  }
     

  const actual = Db._addNode(mDb, 'ciay', 'cane').get('ciay');
  const expected = 'cane';

  assert.deepEqual(actual, expected,
    'should change the old value with the new one');
  assert.end();
});

const memoryDb = {
  _header: {
    head: {
      node: {
        collisionFlag: 0,
        nextPosition: 400,
        value: 'canicanibaubau',
        position: 300,
        normalizedIndex: 1,
        previousKey: 0,
        previousActualIndex: 0,
      },
      key: 'ciao'
    },
    tail: {
      node: {
        collisionFlag: 0,
        nextPosition: 0,
        value: 'canicanibaubau',
        position: 100,
        normalizedIndex: 5,
        previousKey: 'ciau',
        previousActualIndex: 3096844332,
      },
      key: 'cias'
    }
  },
  _nodes: {
    ciao: {
      collisionFlag: 0,
      nextPosition: 400,
      value: 'canicanibaubau',
      position: 300,
      normalizedIndex: 1,
      previousKey: 'ciao',
      nextKey: 'ciar',
      previousActualIndex: 0,
    },
    ciar: {
      collisionFlag: 1,
      nextPosition: 500,
      value: 'canicanibaubau',
      position: 400,
      normalizedIndex: 2,
      previousKey: 'ciao',
      nextKey: 'ciat',
      previousActualIndex: 3096844302,
    },
    ciat :{
      collisionFlag: 0,
      nextPosition: 600,
      value: 'canicanibaubau',
      position: 500,
      normalizedIndex: 2,
      previousKey: 'ciar',
      nextKey: 'ciay',
      previousActualIndex: 3096844302,
    },
    ciay : {
      collisionFlag: 0,
      nextPosition: 700,
      value: 'canicanibaubau',
      position: 600,
      normalizedIndex: 3,
      previousKey: 'ciat',
      nextKey: 'ciau',
      previousActualIndex: 3096844312,
    },
    ciau: {
      collisionFlag: 0,
      nextPosition: 100,
      value: 'canicanibaubau',
      position: 700,
      normalizedIndex: 4,
      previousKey: 'ciay',
      nextKey: 'cias',
      previousActualIndex: 3096844322,
    },
    cias: {
      collisionFlag: 0,
      nextPosition: 0,
      value: 'canicanibaubau',
      position: 100,
      normalizedIndex: 5,
      previousKey: 'ciau',
      nextKey: 'ciau',
      previousActualIndex: 3096844332,
    },
  },
  _hashFunction: function(key) {
    const map = {ciao:3096844302,ciar:3096844312,ciat:3096844312,ciay:3096844322,tttt:3096844322,ciau:3096844332,cias:3096844342,cani:3096844323,kkkk:9096844323,rrrr:5};
    return map[key];
  }
};
