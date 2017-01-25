const MemoryDb = require('./MemoryDb.js').MemoryDb;
const Errors = require('./Errors.js');
const rlp = require('rlp');
class Db {
  // Db is the object that expose the localStorage API
  // _buffer is the buffer that contain the raw data that we can find in the file where the db is saved
  // _memoryDb is the js object that contain all the keys and values so serialize(_memoryDb) -> _buffer
  // For get(key) we just need to do memoryDb.key.
  // For set an item we need to query memoryDb for the positions in the buffer of the neigbors of the item that we want to set
  // than we have to serialize the item then we have to append the item to the buffer then we have to
  // modify in the buffer the item's neighbors for point to the new item, finally we update memoryDb.
  // _buffer should be a special object that extend Buffer and when we write something to _buffer it should write
  // the changes to a specular file at a predefined path. Of course all work also with a simple buffer but without
  // the persistence of the data
  cosntructor(buffer, memoryDb, path) {
    this._buffer = buffer;
    this._memoryDb = memoryDb;
    this. path = path;
  }
}

function builder(path, environment) {
  // Take a path (string) and an environment (node, mobile, browser)
  // Return new Db()
  const buffer = bufferFromPath(path, environment);
  const memoryDb = bufferParser(buffer);
  return new Db(buffer, memoryDb, path);
}



function storedDbFromPath(path, environment) {
  // return a class that extends Buffer and is an abstarction of a file so that work in several envioronment
}

function memoryDbFromStoredDb(buffer) {
  // take a buffer and return new MemoryDb()
  //  find position
  //  find normalized index
  //  find previous key
  //  find next key
  //  find previous actual index
  return {get: function(key){return {value:key};}};
}

function _parseHeader(header) {
  // Return head and tail byte position of a serilized db
  if (header.length < 24) {
    // sanity check head should be 24 byte
    throw new Errors.ParseHeaderInvalidInput();
  }
  const magic = header.slice(0,8).toString();
  if (magic !== 'KyVeKyVe') {
    // sanity check head should start with 8 byte magic number
    throw new Errors.ParseHeaderInvalidInput();
  }
  const head = header.slice(8,16).readIntBE(0,8);
  const tail = header.slice(16,24).readIntBE(0,8);
  return {head, tail};
}

function _parseNode(node, keyLen) {
  // traverse and parse a buffer (data) and return an Object (dict) that encode the data
  let collisionFlag;
  if (node[0] === 16) {
    // bite 0 encode the collision flag, if byte 0 is 16 bit 0 is 1
    collisionFlag = true;
  }
  else if (node[0] === 0) {
    collisionFlag = false;
  }
  else {
    throw UndifinedError;
  }

  const nextNode = node.slice(1,9).readIntBE(0,8);
  const key = rlp.decode(node.slice(9, 9 + keyLen)).toString();
  const value = rlp.decode(node.slice(9 + keyLen, node.length)).toString();
  return {collisionFlag, nextNode, key, value};
}

function _splitData(data, nodes = []) {
  //
  // Take the data part of the stored db, that mean the whole db without the header, and
  // return a list of lists: [[node1, keyLen1],[node2, keyLen2], ..., [noden,keyLenn]]
  // node is byte array that rapresent the node in the stored db:
  //
  //
  //    collision flab      next node byte position    rlp encoded string (value)
  //             ^                     ^                       ^
  //          [1 bit,    7 bits,    8 bytes,    variable,    variable]
  //                        v                      v
  //                    reserved        rlp encoded string (key)
  //
  //
  // keyLen is the lenght in bytes of the encoded key.
  //
  const keyLen = rlp.getLength(data.slice(9));
  const valueLen = rlp.getLength(data.slice(9 + keyLen));
  const firstNode = data.slice(0, 9 + keyLen + valueLen);
  const bufferWithoutFirstNode = data.slice(9 + keyLen + valueLen);
  nodes.push([firstNode, keyLen]);
  if (bufferWithoutFirstNode.length === 0) {
    return nodes;
  }
  else {
    return _splitData(bufferWithoutFirstNode, nodes);
  }
}

module.exports._parseHeader = _parseHeader;
module.exports._parseNode = _parseNode;
module.exports._splitData = _splitData;
module.exports.memoryDbFromStoredDb = memoryDbFromStoredDb;
