const StoredDb = require('./StoredDb.js');
const Parser = require('./Parser.js');
const hash = require('fnv1a');

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
  }
}

function loadDb(path, environment) {
  //
  // Take a path (string) and an environment (node, mobile, browser)
  // Return new Db()
  //
  const storedDb = new StoredDb.StoredDb(path, environment);
  const memoryDb = Parser.memoryDbFromStoredDb(storedDb, hash);
  //return [storedDb, memoryDb, path];
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
  // Return {index, prevNodePosition, nextNodePosition, alreadyInDb, collisions}
function _setItem(Db, key, value) {
  //
  // If the key is already in the db update the node.
  // If is not in the db add the node
  //
  const keyData = MemoryDb.inspectKey(key);
  if (keyData.alreadyInDb) {
    Db._updateNode(Db, key, value);
  }
  else {
    Db._addNode(Db, key, value, keyData);
  }
}

function _updateNode(Db, key, value) {
  //
  // If the new value is bigger than the old one add the node
  // Else update the node
  //
  const oldValue = Db.getItem(key);
  if (rlp.encode(value).lenght > rlp.encode(oldValue).lenght) {
    Db._addNode(Db, key, value);
  }


module.exports.Db = Db;
module.exports.loadDb = loadDb;
module.exports.createNewDb = createNewDb;
