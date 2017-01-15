const test = require('tape');
const Db = require('../DB.js');
const Errors = require('../Errors.js');

test('Db._getPreviousIndex(memDb, index) returned value for index not in db', assert => {
  const actual = Db._getPreviousIndex(memoryDb, 3096844323);
  const expected = 3096844322;

  assert.deepEqual(actual, expected,
    'should return the biggest index that is smaller than the one passed');
  assert.end();
});

test('Db._getPreviousIndex(memDb, index) returned value for index db', assert => {
  const actual = Db._getPreviousIndex(memoryDb, 3096844322);
  const expected = 3096844312;

  assert.deepEqual(actual, expected,
    'should return the biggest index that is smaller than the one passed');
  assert.end();
});

test('Db._getPreviousIndex(memDb, index) returned value smallest index', assert => {
  const actual = Db._getPreviousIndex(memoryDb, 5);
  const expected = 0;

  assert.deepEqual(actual, expected,
    'should return 0 if the index is smaller than all the other in the db');
  assert.end();
});

test('Db._getPreviousIndex(memDb, index) returned value biggets index', assert => {
  const actual = Db._getPreviousIndex(memoryDb, 9096844323);
  const expected = 3096844342;

  assert.deepEqual(actual, expected,
    'should return the last index when we pass an index thah is bigger than all the other in the db');
  assert.end();
});

test('Db.inspect(key, memDb, hashFun) returned value for key not in DB', assert => {
  function hashFucntion(key) {
    const map = {ciao:3096844302,ciar:3096844312,ciat:3096844312,ciay:3096844322,ciau:3096844332,cias:3096844342,cani:3096844323};
    return map[key];
  }
  const actual = Db._inspect('cani', memoryDb, hashFucntion);
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

test('Db.inspect(key, memDb, hashFun) returned value for key in DB', assert => {
  function hashFucntion(key) {
    const map = {ciao:3096844302,ciar:3096844312,ciat:3096844312,ciay:3096844322,ciau:3096844332,cias:3096844342,cani:3096844323};
    return map[key];
  }
  const actual = Db._inspect('ciau', memoryDb, hashFucntion);
  const expected = {
    normalizedIndex: 4,
    previousNodePosition: 600,
    nextNodePosition: 700,
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

test('Db.inspect(key, memDb, hashFun) returned value when previus index contain more than one node (collision)', assert => {
  function hashFucntion(key) {
    const map = {ciao:3096844302,ciar:3096844312,ciat:3096844312,ciay:3096844322,ciau:3096844332,cias:3096844342,cani:3096844323};
    return map[key];
  }
  const actual = Db._inspect('ciay', memoryDb, hashFucntion);
  const expected = {
    normalizedIndex: 3,
    previousNodePosition: 500,
    nextNodePosition: 600,
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

test('Db.inspect(key, memDb, hashFun) returned value for key not in db but with a collision', assert => {
  function hashFucntion(key) {
    const map = {ciao:3096844302,ciar:3096844312,ciat:3096844312,ciay:3096844322,tttt:3096844322,ciau:3096844332,cias:3096844342,cani:3096844323};
    return map[key];
  }
  const actual = Db._inspect('tttt', memoryDb, hashFucntion);
  const expected = {
    normalizedIndex: 3,
    previousNodePosition: 500,
    nextNodePosition: 600,
    alreadyInDb: false,
    collisions:1
  };

  assert.deepEqual(actual, expected,
    'previousIndexPosition should be the position of the node at the index before the index of the key ' +
    'nextNodePosition should be the position of the node at the index after the index of the key in (last element of boucket)' +
    'alreadyInDb should be false for key not presented in db ' +
    'collisions should be < 0 for key that collide');
  assert.end();
});

test('Db.inspect(key, memDb, hashFun) returned value for key  in db and with a collision', assert => {
  function hashFucntion(key) {
    const map = {ciao:3096844302,ciar:3096844312,ciat:3096844312,ciay:3096844322,ciau:3096844332,cias:3096844342,cani:3096844323};
    return map[key];
  }
  const actual = Db._inspect('ciat', memoryDb, hashFucntion);
  const expected = {
    normalizedIndex: 2,
    previousNodePosition: 300,
    nextNodePosition: 400,
    alreadyInDb: true,
    collisions:2
  };

  assert.deepEqual(actual, expected,
    'previousIndexPosition should be the position of the node at the index before the index of the key ' +
    'nextNodePosition should be the position of the node at the index after the index of the key in (last element of boucket)' +
    'alreadyInDb should be true for key presented in db ' +
    'collisions should be < 0 for key that collide');
  assert.end();
});

const memoryDb = {
  _header: {
    head: 3096844302,
    tail: 3096844342,
  },
  _nodes: {
    3096844302: {
      collisionFlag: 0,
      nextPosition: 400,
      key: 'ciao',
      value: 'canicanibaubau',
      position: 300,
      normalizedIndex: 1,
      previousIndex: 0,
    },
    3096844312: [{
      collisionFlag: 1,
      nextPosition: 500,
      key: 'ciar',
      value: 'canicanibaubau',
      position: 400,
      normalizedIndex: 2,
      previousIndex: 3096844302,
    },{
      collisionFlag: 0,
      nextPosition: 600,
      key: 'ciat',
      value: 'canicanibaubau',
      position: 500,
      normalizedIndex: 2,
      previousIndex: 3096844302,
    }],
    3096844322: {
      collisionFlag: 0,
      nextPosition: 700,
      key: 'ciay',
      value: 'canicanibaubau',
      position: 600,
      normalizedIndex: 3,
      previousIndex: 3096844312,
    },
    3096844332: {
      collisionFlag: 0,
      nextPosition: 100,
      key: 'ciau',
      value: 'canicanibaubau',
      position: 700,
      normalizedIndex: 4,
      previousIndex: 3096844322,
    },
    3096844342: {
      collisionFlag: 0,
      nextPosition: 0,
      key: 'cias',
      value: 'canicanibaubau',
      position: 100,
      normalizedIndex: 5,
      previousIndex: 3096844332,
    },
  },
};
