const R = require('ramda');
const Errors = require('./Errors.js');

class MemoryDb {
  // _header should be an Header object
  // _nodes should be {string: Node object, string: Node object, ...}
  // _hashFunction is a function that take a string and return an int
  constructor(header, nodes, hashFucntion) {
    this._header = header;
    this._nodes = nodes;
    this._hashFunction = hashFucntion;
  }

  inspectKey(key) {
    // Return index and buffer's positions of the key's node if the node is in db
    // Return index and buffer's positions for useful for insert the node in the buffer if key's node is not in the db
    return _inspect(this, key);
  }

  get(key) {
    return this._nodes[key].value;
  }

  getPosition(key) {
    return this._nodes[key].position;
  }

  updateNode(key, value) {
    return _updateNode(this, key, value);
  }

  addNode(key, node, nodePosition) {
    updatedObject = _addNode(this, node, nodePosition);
    this.header = updatedObject.header;
    this.nodes = updatedObject.nodes;
    return this;
  }
}

function _inspect(memoryDb, key) {
  //
  // key is a string
  // Return {index, prevNodePosition, nextNodePosition, alreadyInDb, collisions}
  // collisions is int, number of collisions
  //
  // When we inspect a key that is not in the db but that have a collision:
  //     prevNodePosition should be the node after the boucket
  //     nextNodePosition should be the position of the first node of the boucket
  //     we insert the new node at the head of the boucket
  //

  const alreadyInDb = _keyAlreadyInDb(memoryDb, key);
  const collisions = _collisionsNumber(memoryDb, key);
  const previousNodePosition = _findPrevPosition(memoryDb, key);
  const nextNodePosition = _findNextPosition(memoryDb, key);
  const normalizedIndex = _keyToNormalizedIndex(memoryDb, key);

  return {
    normalizedIndex: normalizedIndex,
    previousNodePosition: previousNodePosition,
    nextNodePosition: nextNodePosition,
    alreadyInDb: alreadyInDb,
    collisions: collisions,
  };
}

function _keyAlreadyInDb(memoryDb, key) {
  //
  // Return true if the key is in db
  //
  const node = memoryDb._nodes[key];
  const alreadyInDb = node !== undefined;
  return alreadyInDb;
}

function _keyToNormalizedIndex(memoryDb, key) {
  //
  // ....
  //
  const node = memoryDb._nodes[key];
  const alreadyInDb = node !== undefined;
  if (alreadyInDb) {
    return node.normalizedIndex;
  }
  else {
    const prevNode = _getPreviousNode(memoryDb, key);
    if (prevNode === 'head') {
      return 1;
    }
    else {
      return prevNode.normalizedIndex + 1;
    }
  }
}

function _findPrevPosition(memoryDb, key) {
  //
  // ...
  //
  const node = memoryDb._nodes[key];
  const alreadyInDb = node !== undefined;
  if (alreadyInDb) {
    return _prevPositionForKeyAlreadyInDb(memoryDb, key);
  }
  else {
    return _prevPositionForKeyNotInDb(memoryDb, key);
  }
}

function _findNextPosition(memoryDb, key) {
  //
  // ...
  //
  const node = memoryDb._nodes[key];
  const alreadyInDb = node !== undefined;
  if (alreadyInDb) {
    return _nextPositionForKeyAlreadyInDb(memoryDb, key);
  }
  else {
    return _nextPositionForKeyNotInDb(memoryDb, key);
  }
}

function _prevPositionForKeyAlreadyInDb(memoryDb, key) {
  //
  // ...
  //
  const node = memoryDb._nodes[key];
  return memoryDb._nodes[node.previousKey].position;
}

function _nextPositionForKeyAlreadyInDb(memoryDb, key) {
  //
  // ...
  //
  const node = memoryDb._nodes[key];

  //when nextNodePosition is 0 the key is a tail
  if (node.nextPosition === 0){
    return 'tail'
  }

  return node.nextPosition;
  return;
}

function _prevPositionForKeyNotInDb(memoryDb, key) {
  //
  // ...
  //
  const prevNode = _getPreviousNode(memoryDb, key);
  if (prevNode.collisionFlag === 1) {

    // the previousNode should be the last node of the boucket
    const boucket = _traverseBoucket(memoryDb, prevNode);
    previousNodePosition = boucket[boucket.length - 1].position;
  }
  else if (prevNode.collisionFlag === 0) {
    previousNodePosition = prevNode.position;
  }
  else if (prevNode === 'head') {
    previousNodePosition = 'head';
  }
  else {
    throw UnknownError;
  }
  return previousNodePosition;
}

function _nextPositionForKeyNotInDb(memoryDb, key) {
  //
  // ...
  //
  const prevNode = _getPreviousNode(memoryDb, key);
  if (prevNode.collisionFlag === 1) {

    // the nextNode should be the node after the last bucket's node
    const boucket = _traverseBoucket(memoryDb, prevNode);
    nextNodePosition = boucket[boucket.length - 1].nextPosition;
  }
  else if (prevNode.collisionFlag === 0) {
    nextNodePosition = prevNode.nextPosition;
  }
  else if (prevNode === 'head') {
    nextNodePosition = memoryDb._header.head.node.position;
  }//TODO check also for tail with and without collision flag
  else {
    throw UnknownError;
  }

  //when nextNodePosition is 0 the key is a tail
  if (nextNodePosition === 0){
    return 'tail'
  }
  return nextNodePosition;
}

function _keyIsBiggerThanTail(memoryDb, key) {
  //
  // key -> yes | no | collide | isTail
  // if the key is == heade.tail return isTail
  //
  const tailKey = memoryDb._header.tail.key;
  const keyIndex = memoryDb._hashFunction(key);
  const tailIndex =  memoryDb._hashFunction(tailKey);
  if (tailKey === key) {
    return 'isTail';
  }
  else if (tailIndex === keyIndex) {
    return 'collide';
  }
  else if (tailIndex < keyIndex) {
    return 'yes';
  }
  else if (tailIndex > keyIndex) {
    return 'no';
  }
  else {
    throw UnknownError;
  }
}

function _keyIsSmallerThanHead(memoryDb, key) {
  //
  // key -> yes | no | collide | isHead
  // if key == head.key return isHead
  //
  const headKey = memoryDb._header.head.key;
  const keyIndex = memoryDb._hashFunction(key);
  const headIndex = memoryDb._hashFunction(headKey);
  if (headKey === key) {
    return 'isHead';
  }
  else if (headIndex === keyIndex) {
    return 'collide';
  }
  else if (headIndex > keyIndex) {
    return 'yes';
  }
  else if (headIndex < keyIndex) {
    return 'no'
  }
  else {
    throw UnimplementedError;
  }
}

function _collisionsNumber(memoryDb, key) {
  const keys = Object.keys(memoryDb._nodes);
  const hash = memoryDb._hashFunction;
  const collisions = keys.reduce( (collisions, _key) => {
    if (hash(key) === hash(_key) && key !== _key) {
      return collisions + 1;
    }
    else {
      return collisions;
    }
  }, 0);
  return collisions;
}

function _getPreviousNode(memoryDb, key) {
  // iterate memoryDb key and when key > indexSerched return the key before

  const hashFunction = memoryDb._hashFunction;
  const indexSearched = hashFunction(key);
  const nodes = memoryDb._nodes;
  const node = nodes[key];
  let prevNode;

  function _findPreviouNodeForKeyNotInDb(nodes, indexSearched) {
    // iterate nodes and return when we find a key such that hash(key) is the biggest of the ones that are smaller than indexSearched
    for (let _key in nodes) {
      const actualIndex = hashFunction(_key);

      if (actualIndex >= indexSearched && indexSearched > nodes[_key].previousActualIndex) {
        // return isHead if there is not in the db a key such that hash(key) < indexSearched
        if (_key === nodes[_key].previousKey) {
          return 'isHead';
        }
        return {node: nodes[nodes[_key].previousKey], key: nodes[_key].previousKey};
      }
    }
    // return the last node if indexSearched is bigger than each key in the db
    return {node: memoryDb._header.tail, key: memoryDb._header.tail.key};
  }

  // we are looking for a key that is not in the db yet
  if (node === undefined) {
    prevNode = _findPreviouNodeForKeyNotInDb(nodes, indexSearched);
  }
  // we are looking for a key that is already in the db
  if (node !== undefined) {
    prevNode = {node: nodes[node.previousKey], key: node.previousKey};
  }

  // if prevNode isHead mean that there aren't node with smaller index than the one inspected in the db so we return 'head'
  if (prevNode === 'isHead') {
    return 'head';
  }

  // if prevNode is part of a boucket (there are collisions) we should return the first element of the boucket
  return _getFirstBoucketNode(memoryDb, prevNode.key);
}

function _getFirstBoucketNode(memoryDb, key) {
  const node = memoryDb._nodes[key];
  if (JSON.stringify(node) === JSON.stringify(memoryDb._header.head.node)) {
    return node;
  }
  const prevNode = memoryDb._nodes[node.previousKey];
  if (prevNode.collisionFlag === 0) {
    return node;
  }
  else if (prevNode.collisionFlag === 1) {
    return _getFirstBoucketNode(memoryDb, node.previousKey);
  }
  else {
    throw UnknownError;
  }
}

function _traverseBoucket(memoryDb, node) {
  // take the first element of the boucket and return a list that contain the whole boucket

  function checkValue(memoryDb, node) {
    // check if the key belong at an element the is the first element of a boucket if not
    // throw an appropiate error

    const nodeCollisionFlag = node.collisionFlag;
    const prevNodeCollisionFlag = memoryDb._nodes[node.previousKey].collisionFlag;
    const isHead = node.normalizedIndex === 1;

    // the key do not belong at a node in a boucket
    if (nodeCollisionFlag !== 1 && prevNodeCollisionFlag !== 1) {
      throw new Errors.MemoryDbKeyNotInBoucket();
    }

    // the key is not the first element of the boucket
    if (nodeCollisionFlag === 1 && prevNodeCollisionFlag === 1 && !isHead) {
      throw new Errors.MemoryDbKeyNotFirstInBoucket();
    }

    // the key is not the first element of the boucket
    if (nodeCollisionFlag !== 1 && prevNodeCollisionFlag === 1) {
      throw new Errors.MemoryDbKeyNotFirstInBoucket();
    }
  }

  function traverse(memoryDb, nodes) {
    const nextNode = memoryDb._nodes[nodes[nodes.length - 1].nextKey];
    if (nextNode.collisionFlag === 0) {
      nodes.push(nextNode);
      return nodes;
    }
    else if (nextNode.collisionFlag === 1) {
      nodes.push(nextNode);
      return traverse(memoryDb, nodes);
    }
    else {
      throw UndefinedError;
    }
  }

  checkValue(memoryDb, node);
  return traverse(memoryDb, [node]);
}

function _updateNode(memoryDb, key, value) {
  //
  // Change the value for the key
  // Raise an error if key is not in db or if new value is bigger thanm the old one
  //
  const nodes = memoryDb._nodes;
  if (!(key in nodes)) {
    throw new Errors.MemoryDbKeyNotInDb();
  }
  if (nodes[key].value.length < value.length) {
    throw new Errors.MemoryDbValueTooLong();
  }
  nodes[key].value = value;
  return memoryDb;
}

function _addNode(memoryDb, key, node, nodePosition) {
  //
  // add node to memoryDb._nodes
  // change nextPosition in previousNode with nodePosition
  //TODO special beavior for tail and head
  //
  const db = R.clone(memoryDb);
  memoryDb = db;
  nodes = memoryDb._nodes;

  // When node is heade
  if (node.previousKey === key) {
    memoryDb._header.head = {key:key, node:node};
    nextIndex = nodes[node.nextKey].normalizedIndex;
    // add 1 to indexes bigger than node.index - 1 
    nodes = getBiggerOfAndAddX(nextIndex - 1, 1, nodes, 'normalizedIndex');
    nodes[key] = node;
    nodes[node.previousKey].nextPosition = nodePosition;
    memoryDb._nodes = nodes;
    return memoryDb;
  }
  else if (node.nextKey === 'tail') {
    memoryDb._header.tail = {key:key, node:node};
    nodes[key] = node;
    nodes[node.previousKey].nextPosition = nodePosition;
    memoryDb._nodes = nodes;
    return memoryDb;
  }
  else {
    nextIndex = nodes[node.nextKey].normalizedIndex;
    // add 1 to indexes bigger than node.index 
    nodes = getBiggerOfAndAddX(nextIndex, 1, nodes, 'normalizedIndex');
    nodes[key] = node;
    nodes[node.previousKey].nextPosition = nodePosition;
    memoryDb._nodes = nodes;
    return memoryDb;
  }
}

function getBiggerOfAndAddX(minumum, x, object, inspectedElement) {
  //
  // TODO move in utils
  // take an object filter for inspectedElement > minumumValue
  // add x at the filtered elements
  // return object - filtered elements + added filtered elements
  //
  function addXIfBigger(value, key, obj) {
    if (value[inspectedElement] > minumum) {
      value[inspectedElement] = value[inspectedElement] + x;
      return value;
    }
    else{
      return value;
    }
  }
  return R.mapObjIndexed(addXIfBigger, object);
}

module.exports.MemoryDb = MemoryDb;
// ---------ONLY---FOR---TEST--------------------
module.exports._inspect = _inspect;
module.exports._getPreviousNode = _getPreviousNode;
module.exports._traverseBoucket = _traverseBoucket;
module.exports._updateNode = _updateNode;
module.exports._addNode = _addNode;
module.exports._keyIsBiggerThanTail = _keyIsBiggerThanTail;
module.exports._keyIsSmallerThanHead = _keyIsSmallerThanHead;
