const NodeHook = require('./NodeHook.js').NodeHook;
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
      this._hook = new NodeHook(path);
    }
    else {
      throw new Errors.StoredDbNotSupportedEnv();
    }
  }

  slice(start, end) {
    return this._hook.slice(start, end);
  }
}

function _updateNode(StoredDb, node, key, value) {
  // Update the node in the stored db, if the new value is bigger
  // than the value in the node throw an error
  //

  // Check if the value is too big
  if (value.length > node.value.length) {
    throw new Errors.StoredDbUpdateNodeValueTooLong();
  }

  const keyLen = rlp.encode(key).length;
  const writePosition = node.position + 24 + keyLen;
  return StoredDb._hook.write(value, writePosition);
}

function _addNode(StoredDb, bo) {
}

function _deleteNode(StoredDb, bo) {
}
module.exports.StoredDb = StoredDb;
module.exports._updateNode = _updateNode;
