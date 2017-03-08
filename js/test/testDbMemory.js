const R = require('ramda');
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

test('Db.inspect returned value for key that is not db that is head', assert => {
  const actual = Db._inspect(memoryDb, 'cini');
  const expected = {
    normalizedIndex: 1,
    previousNodePosition: 'head',
    nextNodePosition: 300,
    alreadyInDb: false,
    collisions: 0
  };

  assert.deepEqual(actual, expected,
    'when whe inpect a key that is not in the db and that when added will be the head nextNodePosition should be the head position and previousNodePosition should be `head`');
  assert.end();
});
test('Db.inspect returned value for key that is in db that is head', assert => {
  const actual = Db._inspect(memoryDb, 'ciao');
  const expected = {
    normalizedIndex: 1,
    previousNodePosition: 300,
    nextNodePosition: 400,
    alreadyInDb: true,
    collisions: 0
  };

  assert.deepEqual(actual, expected,
    'when we inspect a key that is the head perviousNodePosition should be equal to position');
  assert.end();
});
test('Db.inspect returned value for key that is not db that is head and collide', assert => {
  const actual = Db._inspect(memoryDb, 'pini');
  const expected = {
    normalizedIndex: 1,
    previousNodePosition: 'head',
    nextNodePosition: 300,
    alreadyInDb: false,
    collisions: 1
  };

  assert.deepEqual(actual, expected,
    'when whe inpect a key that is not in the db that collide with head nextNodePosition should be the head position, previousNodePosition should be `head` and collisions should be 1');
  assert.end();
});
test('Db.inspect returned value for key that is not db that is tail', assert => {
  const actual = Db._inspect(memoryDb, 'kkkk');
  const expected = {
    normalizedIndex: 6,
    previousNodePosition: 100,
    nextNodePosition: 'tail',
    alreadyInDb: false,
    collisions: 0
  };

  assert.deepEqual(actual, expected,
    'when whe inpect a key that is not in the db and index > tail.key.index nextPosition should be `tail` and prevPos should be head.position');
  assert.end();
});
test('Db.inspect returned value for key that is in db that is tail', assert => {
  const actual = Db._inspect(memoryDb, 'cias');
  const expected = {
    normalizedIndex: 5,
    previousNodePosition: 700,
    nextNodePosition: 'tail',
    alreadyInDb: true,
    collisions: 0
  };

  assert.deepEqual(actual, expected,
    'when we inspect a key that is the tail nextNodePosition sould be `tail`');
  assert.end();
});
test('Db.inspect returned value for key that is not db that is tail and collide', assert => {
  const actual = Db._inspect(memoryDb, 'tias');
  const expected = {
    normalizedIndex: 5,
    previousNodePosition: 700,
    nextNodePosition: 100,
    alreadyInDb: false,
    collisions: 1
  };

  assert.deepEqual(actual, expected,
    'when whe inpect a key that is not in the db that collide with tail nextNodePosition should be the position of the first element of the tail bucket, previousNodePosition should be the position of the element that come after of the first element of the tail bucket and collisions should be 1');
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
    value: 'new value',
    previousKey: 'ciat',
    nextKey: 'ciay'
  }
  const newNodePosition = 1000;
  const actual = Db._addNode(memoryDb, 'grulli', newNode, newNodePosition)._nodes.ciat.nextPosition;
  const expected = 1000;

  assert.deepEqual(actual, expected,
    'should change nextPosition in the previousNode');
  assert.end();
});

test('Db addNode returned value', assert => {
  const newNode = {
    value: 'new value',
    previousKey: 'ciat',
    nextKey: 'ciay'
  }
  const newNodePosition = 1000;
  const actual = Db._addNode(memoryDb, 'grulli', newNode, newNodePosition)._nodes.grulli;
  const expected = newNode;

  assert.deepEqual(actual, expected,
    'should add newNode to MemoryDb._nodes');
  assert.end();
});

test('Db addNode returned value', assert => {
  const newNode = {
    value: 'new value',
    previousKey: 'ciat',
    nextKey: 'ciay'
  }
  const newNodePosition = 1000;
  const actual = Db._addNode(memoryDb, 'grulli', newNode, newNodePosition)
    ._nodes.ciay.normalizedIndex;
  const expected = 4;

  assert.deepEqual(actual, expected,
    'should add 1 to the indexes of the nodes that come after the added node');
  assert.end();
});

test('Db addNode returned value for head', assert => {
  const newNode = {
    value: 'new value',
    previousKey: 'grulli',
    nextKey: 'ciao',
  }
  const newNodePosition = 1000;
  const actual = Db._addNode(memoryDb, 'grulli', newNode, newNodePosition)
    ._header.head;
  const expected = {key: 'grulli', node:newNode};

  assert.deepEqual(actual, expected,
    'should add change memoryDb._header.head');
  assert.end();
});

test('Db addNode returned value for tail', assert => {
  const newNode = {
    value: 'new value',
    previousKey: 'cias',
    nextKey: 'tail',
  }
  const newNodePosition = 1000;
  const actual = Db._addNode(memoryDb, 'grulli', newNode, newNodePosition)
    ._header.tail;
  const expected = {key: 'grulli', node:newNode};

  assert.deepEqual(actual, expected,
    'should add change memoryDb._header.tail');
  assert.end();
});

test('Db keyIsBiggerThanTail returned value for bigger key', assert => {
  const actual = Db._keyIsBiggerThanTail(memoryDb, 'kkkk');
  const expected = 'yes';

  assert.deepEqual(actual, expected,
    'should return yes if the key is bigger');
  assert.end();
});

test('Db keyIsBiggerThanTail returned value for smaller key', assert => {
  const actual = Db._keyIsBiggerThanTail(memoryDb, 'cini');
  const expected = 'no';

  assert.deepEqual(actual, expected,
    'should return no if the key is smaller');
  assert.end();
});

test('Db keyIsBiggerThanTail returned value for same key', assert => {
  const actual = Db._keyIsBiggerThanTail(memoryDb, 'cias');
  const expected = 'isTail';

  assert.deepEqual(actual, expected,
    'should return isTail if the key is the same key');
  assert.end();
});

test('Db keyIsBiggerThanTail returned value for key that collide', assert => {
  const actual = Db._keyIsBiggerThanTail(memoryDb, 'yhj');
  const expected = 'collide';

  assert.deepEqual(actual, expected,
    'should return collide if the key is the same key');
  assert.end();
});

test('Db keyIsSmallerThanHead returned value for smaller key', assert => {
  const actual = Db._keyIsSmallerThanHead(memoryDb, 'cini');
  const expected = 'yes';

  assert.deepEqual(actual, expected,
    'should return yes if the key is smaller');
  assert.end();
});

test('Db keyIsSmallerThanHead returned value for bigger key', assert => {
  const actual = Db._keyIsSmallerThanHead(memoryDb, 'cani');
  const expected = 'no';

  assert.deepEqual(actual, expected,
    'should return no if the key is bigger');
  assert.end();
});

test('Db keyIsSmallerThanHead returned value for the same key', assert => {
  const actual = Db._keyIsSmallerThanHead(memoryDb, 'ciao');
  const expected = 'isHead';

  assert.deepEqual(actual, expected,
    'should return isHead if the key is the same');
  assert.end();
});

test('Db keyIsSmallerThanHead returned value for a key that collide', assert => {
  const actual = Db._keyIsSmallerThanHead(memoryDb, 'ffff');
  const expected = 'collide';

  assert.deepEqual(actual, expected,
    'should return collid if the key collide if the one in the head');
  assert.end();
});

test('Db nodeFromIndex returned value', assert => {
  const actual = Db._nodeFromIndex(memoryDb, 2);
  const expected = {
    ciar: memoryDb._nodes.ciar,
    ciat: memoryDb._nodes.ciat
  };

  assert.deepEqual(actual, expected,
    'should return the an dict of nodes with normalizedIndex === index');
  assert.end();
});

test('Db nodeFromIndex error raised for index out of range', assert => {
  let actual;
  let expected;
  try {
    Db._nodeFromIndex(memoryDb, 67);;
  }
  catch(e) {
    actual = e.constructor.name;
  }
  try {
    throw new Errors.MemoryDbIndexOutOfRange();
  }
  catch(e) {
    expected = e.constructor.name;
  }

  assert.deepEqual(actual, expected,
    'when we pass an index out of range should raise MemoryDbIndexOutOfRange');
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
        nextPosition: 'tail',
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
      nextPosition: 'tail',
      value: 'canicanibaubau',
      position: 100,
      normalizedIndex: 5,
      previousKey: 'ciau',
      nextKey: 'ciau',
      previousActualIndex: 3096844332,
    },
  },
  _hashFunction: function(key) {
    const map = {cini: 33,
      ciao:3096844302,
      ciar:3096844312,
      ciat:3096844312,
      ciay:3096844322,
      tttt:3096844322,
      ciau:3096844332,
      cias:3096844342,
      cani:3096844323,
      kkkk:9096844323,
      rrrr:5,
      yhj:3096844342,
      ffff:3096844302,
      pini:3096844302,
      tias:3096844342
    };
    return map[key];
  }
};
