const test = require('tape');
const Utils = require('../utils/initStoredDb.js');

//test('nodeFromData returned value', assert => {
//  const nodeData = {
//    index: 23,
//    collisionFlag: 0,
//    prevNodePosition: 1254,
//    nextNodePosition: 345,
//    alreadyInDb: false,
//  };
//  const actual = Utils.createNode(nodeData);
//
//  const expected = {
//    collisionFlag: 0,
//    nextPosition: 345,
//    value: 'ciaociccio',
//    position: 10000,
//    normalizedIndex: 23,
//    //previousKey: 'ciao',
//    //nextKey: 'ciar',
//    //previousActualIndex: 0,
//  }
//
//  assert.deepEqual(actual, expected,
//    'should return a well constructed node');
//  assert.end();
//});

test('intToBuffer8 returned value', assert => {
  const actual = Utils.intToBuffer8(24).toString('hex');
  const expected = '0000000000000018';

  assert.deepEqual(actual, expected,
    'should return the int ecoded as a BE 8 byte hex buffer with following 0s');
  assert.end();
});
