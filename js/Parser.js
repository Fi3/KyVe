const MemoryDb = require('./MemoryDb.js').MemoryDb;
const Node = require('./MemoryDb.js').Node;
const Errors = require('./Errors.js');
const rlp = require('rlp');

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
  //const header = _parseHeader(buffer.slice(0, 16));
  //const nodes = _splitData(buffer.slice(16, buffer.length)).map(node => _parseNode(node));
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

function _parseNodes(nodes) {
  // Take the output of _splitData [[bufferizedNode1, keyLen1], ....] and return [nodes1, nodes2, ...]
  // The returned node has not the fileds normalizedIndex, previousKey, nextKey, previousActualIndex
  // The actual parsing of the node is let to _parseNode, the dutys of this function are:
  //
  //   1. find the byte position of the nodes in the stroedDb
  //   2. feed _parseNode with node and keyLen
  //   3. put all together in a list of nodes
  //
  let bytePosition = 16;
  const parsedNodes = nodes.map( value => {
    const node = value[0];
    const keyLen = value[1];
    const parsedNode = _parseNode(node, keyLen);
    parsedNode.position = bytePosition;
    bytePosition = bytePosition + node.length;
    return parsedNode;
  });
  return parsedNodes;
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

function _setIndexes(nodes, hash) {
  //
  // Take an array of nodes and return the same array but add the field index at every node
  // actualIndexes are hash(key) indexes are actual index normalized (13,88,98,98,100) => (1,2,3,4,5,6)
  // When we have a collision like the 98s above the node with collision flag 0 have to come first
  // then the nodes with collisions flag 1. When we parse the buffer we do not need to check the collisions
  // for find the node with collision flag === 0 for put this node before the one with collision flag 1.
  // This becaouse when we write on the stored db and we have a collision we put the new node (with flag 1) after
  // the first one (with flag 0)
  //
  //  | -------------------------------------|
  //  | N.B. !!! the index of first node is 1|
  //  |--------------------------------------|
  //

  // Extract and sort all actual indexes from nodes
  const actualIndexes = nodes.map(node => hash(node.key));
  actualIndexes.sort((a, b) => a-b);

  // Map nodes and find the  norm index for every node:
  let lastNormIndex;
  const indexedNodes = nodes.map(node => {
    let normIndex;
    if (node.collisionFlag === true) {
      normIndex = lastNormIndex + 1;
    }
    else {
      const actualIndex = hash(node.key);
      normIndex = actualIndexes.indexOf(actualIndex) + 1;
    }
    lastNormIndex = normIndex;
    node.index = normIndex;
    return node;
  });
  return indexedNodes;
}

//function _setKeys(nodes, hash) {
//  // Take an array of nodes and return the same array but add the fields
//  // previousKey, nextKey and previuosActualIndex at every node
//  const nodesWithKeys = nodes.map(node => {
//
//    let previousKey;
//    let previousActualIndex;
//    // if node is head prevKey should be node.key and prevActualIndex should be 0
//    return node.index;
//    //if (node.index === 0) {
//    //  previousKey = node.key;
//    //  previousActualIndex = 0;
//    //}
//    //else {
//    //  const prevNode = nodes.filter(pNode => pNode.index === node.index - 1)[0];
//    //  previousKey = prevNode.key;
//    //  previousActualIndex = hash(previousKey);
//    //}
//
//    //let nextKey;
//    //// if node is tail nextKey should be node.key
//    //if (node.index === nodes.length - 1) {
//    //  nextKey = node.key;
//    //}
//    //else {
//    //  const nextNode = nodes.filter(nNode => nNode.index === node.index + 1)[0];
//    //  nextKey = nextNode.key;
//    //}
//
//    //node.previousKey = previousKey;
//    //node.nextKey = nextKey;
//    //node.previuosActualIndex = previousActualIndex;
//    //return node;
//  });
//  return nodesWithKeys;
//}


module.exports.memoryDbFromStoredDb = memoryDbFromStoredDb;
module.exports._parseHeader = _parseHeader;
module.exports._parseNode = _parseNode;
module.exports._parseNodes = _parseNodes;
module.exports._splitData = _splitData;
module.exports._setIndexes = _setIndexes;
//module.exports._setKeys = _setKeys;
