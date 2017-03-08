const test = require('tape');
const Utils = require('../utils/initStoredDb.js');

test('nodeFromData returned value', assert => {
  const value = 'ciaociccio'
  const position = 10000;
  const nodeData = {
    index: 23,
    collisions: 0,
    prevNodePosition: 1254,
    nextNodePosition: 345,
    alreadyInDb: False,
  };
  const expected = {
    collisionFlag: 0,
    nextPosition: 345,
    value: 'ciaociccio',
    position: 10000
    normalizedIndex: 23,
    //previousKey: 'ciao',
    //nextKey: 'ciar',
    //previousActualIndex: 0,
  }
  const actual = Db._getPreviousNode(memoryDb, 'cani');
  const expected = memoryDb._nodes.ciay;


  assert.deepEqual(actual, expected,
    'should return a well constructed node');
  assert.end();
});
