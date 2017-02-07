const NodeHook = require('./NodeHook.js');
const Errors = require('./Errors.js');
const rlp = require('rlp');

class StoredDb {
  //
  // StoredDb is the dumped db, when we load a stored db we need StoredDb for read the stored db.
  // We need StoredDb also when we want set a new key:value node or change the value of an already present key,
  // for ensure the data persistency we need to write the stored db before than the one in memory, StoredDb
  // expose the API for read and write the stored db.
  // For initialize a StoredDb we need:
  //
  //   path: the absolute path where the db is stored
  //   env: the environment where the db is stored (node, cordova, cloud, ...)
  //
  constructor(path, env) {
    if (env === 'node') {
      this._hook = new NodeHook.NodeHook(path);
    }
    else {
      throw new Errors.StoredDbNotSupportedEnv();
    }
    this.length = this._hook.length();
  }

  slice(start, end) {
    return this._hook.slice(start, end);
  }

  updateNode(nodePosition, key, value, oldValue) {
    return _updateNode(this, nodePosition, key, value, oldValue);
  }

  addNode(node, previousNodePosition) {
    return _addNode(this, node, previousNodePosition);
  }

}

function _updateNode(StoredDb, nodePosition, key, value, oldValue) {
  //
  // Update the node in the stored db, if the new value is bigger
  // than the value in the node throw an error
  //

  // Check if the value is too big
  if (value.length > oldValue.length) {
    throw new Errors.StoredDbUpdateNodeValueTooLong();
  }

  const keyLen = rlp.encode(key).length; //TODO pass bufferized key???
  const offset = nodePosition + 24 + keyLen;
  return StoredDb._hook.write(value, offset);
}

function _changeNext(StoredDb, nodePosition, newNextPosition) {
  //
  // Change the nexPosition value of the node at nodePosition
  //
  const offset = nodePosition + 8;
  const newNextPositionBufferized = Buffer.allocUnsafe(8);
  newNextPositionBufferized.writeIntBE(newNextPosition, 0, 8);
  return StoredDb._hook.write(newNextPositionBufferized, offset);
}

function _append(StoredDb, node) {
  //
  // Append node at the end of the storedDb
  //
  //   |-------------------------------|
  //   | storedDb is a linked lsit     |
  //   | so append a node at the end   |
  //   | do not mean that the node is  |
  //   | the last element of the list  |
  //   |-------------------------------|
  //
  return StoredDb._hook.append(node);
}

function _addNode(StoredDb, node, previousNodePosition) {
  //
  // Add a new node to StoredDb, in order to do that:
  //  1) in the previous node change next position for point at the new node
  //  2) append the new node
  //
  const newNodePosition = StoredDb._hook.length();
  const storedDbWithNewNode = _append(StoredDb, node);
  const changedNode = _changeNext(StoredDb, previousNodePosition, newNodePosition);
  return {changedNode, newLength: storedDbWithNewNode.length};
}

function createStoredDb(path, env) {
  //
  // Initialize a new storedDb
  //
  if (env === 'node') {
    NodeHook.init(path);
  }
  else {
    throw new Errors.StoredDbNotSupportedEnv();
  }
  return new StoredDb(path, env);
}

module.exports.StoredDb = StoredDb;
module.exports.createStoredDb = createStoredDb;
// ---------ONLY---FOR---TEST--------------------
module.exports._updateNode = _updateNode;
module.exports._changeNext = _changeNext;
module.exports._append = _append;
module.exports._addNode = _addNode;
