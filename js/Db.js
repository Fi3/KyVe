"use strict"
const StoredDb = require('./StoredDb.js');
const Parser = require('./Parser.js');
const hash = require('fnv1a');
const encodeNode = require('./utils/initStoredDb.js').createNode;
const rlp = require('rlp');

class Db {
  //
  // Db is the object that expose the localStorage API
  // For get(key) we just need to do memoryDb.key.
  // For set an item we need:
  //       1) query memoryDb for the positions in the StoredDb of the next and previous node
  //          of the node that we want to set
  //       2) serialize the item then we have to append the item to the buffer then we have to
  //       3) modify in the buffer the item's neighbors for point to the new item
  //       4) finally we update memoryDb.
  //
  constructor(storedDb, memoryDb, path) {
    this._storedDb = storedDb;
    this._memoryDb = memoryDb;
    this._path = path;
  }

  getItem(key) {
    return this._memoryDb.get(key);
  }

  setItem(key, value) {
		this._memoryDb = _setItem(this, key, value);
    return this;
  }
}

function loadDb(path, environment) {
  //
  // Take a path (string) and an environment (node, mobile, browser)
  // Return new Db()
  //
  const storedDb = new StoredDb.StoredDb(path, environment);
  const memoryDb = Parser.memoryDbFromStoredDb(storedDb, hash);
  return new Db(storedDb, memoryDb, path);
}

function createNewDb(path, environment) {
  //
  // Take a path (string) and an environment create a newStroedDb
  // and return new Db()
  //
  StoredDb.createStoredDb(path, environment);
  return loadDb(path, environment);
}

function _setItem(Db, key, value) {
  //
  // If the key is already in the db update the node.
  // If is not in the db add the node
  //
  const keyData = Db._memoryDb.inspectKey(key);
  if (keyData.alreadyInDb) {
    return _updateNode(Db, key, value, keyData);
  }
  else {
    return _addNode(Db, key, value, keyData);
  }
}

function _updateNode(Db, key, value, keyData) {
  //
  // If the new value is bigger than the old one add the node
  // Else update the node
  //
  const oldValue = Db.getItem(key);
  const position = Db.getItem(key);
  if (rlp.encode(value).length > rlp.encode(oldValue).length) {
    return _addNode(Db, key, value, keyData);
  }
  else {
		console.log('minore');
    Db._storedDb.updateNode(position, key, rlp.encode(value), rlp.encode(oldValue))
    return Db._memoryDb.updateNode(key, value)
  }
}

//TODO this function should be atomic (use log for restore state)
function _addNode(Db, key, value, keyData) {
  //
  // Crate the node
  // Append the node to the end of the stored db, if the node is
  // head or tail update the head or tail position in storedDb.
  // Update MemoryDb with the node.
  //
  const newNode = encodeNode({
    key: key,
    value: value,
    nextNode: keyData.nextNodePosition,
    collisionFlag: _getFlag(keyData.collisions)
  });
  const nodePosition = Db._storedDb.addNode(newNode, keyData.previousNodePosition).newPosition;
  // If head
  if (1 === keyData.normalizedIndex) {
    Db._storedDb.updateHead(nodePosition);
  }
  // If tail
  if ('tail' === keyData.nextPosition) {
    Db._storedDb.updateTail(nodePosition);
  }
  const newMemoryNode = _newMemoryNode(Db, keyData, nodePosition, value);
  return Db._memoryDb.addNode(key, newMemoryNode, nodePosition);
}

function _getFlag(collisions) {
  if (collisions === 0) {
    return 0;
  }
  else {
    return 1;
  }
}

function _newMemoryNode(Db, keyData, newPosition, value) {
	const previousKey = Db._memoryDb.prevKeyFromIndex(keyData.normalizedIndex);
  const newMemoryNode = {
    collisionFlag: _getFlag(keyData.collisions),
    nextPosition: keyData.nextNodePosition,
    value: value,
    position: newPosition,
    normalizedIndex: keyData.normalizedIndex,
    previousKey: previousKey,
    nextKey: Db._memoryDb.nextKeyFromIndex(keyData.normalizedIndex),
    previousActualIndex: Db._memoryDb._hashFunction(previousKey),
  };
  return newMemoryNode;
};
module.exports.Db = Db;
module.exports.loadDb = loadDb;
module.exports.createNewDb = createNewDb;
