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

  const node = memoryDb._nodes[key];
  const prevNode = _getPreviousNode(memoryDb, key);
  let previousNodePosition;
  let nextNodePosition;
  let normalizedIndex;

  // Set alreadyInDb and collisions
  const alreadyInDb = node !== undefined;
  const collisions = _collisionsNumber(memoryDb, key);

  // Set buffer's previous and nex node positions
  if (alreadyInDb) {
    // If key is in db we can use the node's attribute for set prev next positions and index
    previousNodePosition = memoryDb._nodes[node.previousKey].position;
    nextNodePosition = node.nextPosition;
    normalizedIndex = node.normalizedIndex;
  }
  else if (prevNode.collisionFlag === 1) {
    // If key is not in db and the previous node is in a boucket we have to find the last node of the
    // boucket. The key will be inserted after the last boucket's node, so the key's prev position
    // will be last boucket's node position and the key's will be last boucket's node next position,
    // and of courese the indext will be last bouket's node index + 1.
    const boucket = _traverseBoucket(memoryDb, prevNode);
    previousNodePosition = boucket[boucket.length - 1].position;
    nextNodePosition = boucket[boucket.length - 1].nextPosition;
    normalizedIndex = prevNode.normalizedIndex + 1;
  }
  else if (prevNode.collisionFlag !== 1) {
    // If the key is not in db and the previous node is not in a boucket, the key will be inserted
    // after prev node so we can use as key's next and prev positions the position of prevNode and
    // prevNode next position. As index we can use prevNode index + 1.
    previousNodePosition = prevNode.position;
    nextNodePosition = prevNode.nextPosition;
    normalizedIndex = prevNode.normalizedIndex + 1;
  }
  else {
    throw UnknownError;
  }

  return {
    normalizedIndex: normalizedIndex,
    previousNodePosition: previousNodePosition,
    nextNodePosition: nextNodePosition,
    alreadyInDb: alreadyInDb,
    collisions: collisions,
  };
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

module.exports.MemoryDb = MemoryDb;
// ---------ONLY---FOR---TEST--------------------
module.exports._inspect = _inspect;
module.exports._getPreviousNode = _getPreviousNode;
module.exports._traverseBoucket = _traverseBoucket;
module.exports._updateNode = _updateNode;
