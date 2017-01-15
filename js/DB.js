function _inspect(key, memoryDb, hashFucntion) {
  // key is a string, memoryDb is the object that we get from load the db in memory
  // hashFucntion is the function that I use for hashing
  // return {index, getPreviousIndexPosition, nextNodePosition, alreadyInDb, collisions}
  // collisions is int, number of collisions
  const index = hashFucntion(key);
  const node = memoryDb._nodes[index];
  const prevIndex = _getPreviousIndex(memoryDb, index);
  console.log('jhwde', prevIndex, index);
  let prevNode = memoryDb._nodes[prevIndex];
  let alreadyInDb;
  let collisions;
  if (node === undefined) {
    alreadyInDb = false;
    collisions = 0;
  }
  else if (node instanceof Array) {
    alreadyInDb = true;
    collisions = node.length;
  }
  else if (node.key === key) {
    alreadyInDb = true;
    collisions = 0;
  }
  else {
    alreadyInDb = false;
    collisions = 1;
  }
  if (prevNode instanceof Array) {
    prevNode = prevNode[prevNode.length - 1];
  }
  return {
    normalizedIndex: prevNode.normalizedIndex + 1,
    previousNodePosition: prevNode.position,
    nextNodePosition: prevNode.nextPosition,
    alreadyInDb: alreadyInDb,
    collisions: collisions,
  };
}

function _getPreviousIndex(memoryDb, indexSerched) {
  // iterate memoryDb key and when key > indexSerched return the key before
  const nodes = memoryDb._nodes;
  const header = memoryDb._header;
  for (const actualIndex in nodes) {
    let node;
    if (nodes[actualIndex] instanceof Array) { //TODO NOT TESTED!!
      node = nodes[actualIndex][0];
    }
    else {
      node = nodes[actualIndex];
    }
    const previousIndex = node.previousIndex;
    if (indexSerched == actualIndex) {
      return previousIndex;
    }
    if (indexSerched < actualIndex && actualIndex > previousIndex) {
      return previousIndex;
    }
  }
  return header.tail;
}

class node {
  // how is rapresented a node in memory
  constructor(collisionFlag, nextPosition, key, value, position, normalizedIndex, previousIndex) {
    // collisionFlag is 0 or 1
    // nextPosition is int, file byte position of the next node, 0 if tail
    // key is string
    // value is string
    // position is int, file byte position of this node
    // normalized index is int, if hash(key) is actual index normalized index is
    //    min(hash(key1), ..., hash(keyn)) => 0 MAX(hash(key1)...) => n all the
    //    other element accordingly
    // previousIndex is int, is actual index of previous node, 0 if head
    this.collisionFlag = collisionFlag;
    this.nextPosition = nextPosition;
    this.key = key;
    this.value = value;
    this.position = position;
    this.normalizedIndex = normalizedIndex;
    this.previousIndex = previousIndex;
  }
}

class memoryDb {
  constructor(header, nodes, hashFucntion) {
    this._header = header;
    this._nodes = nodes;
    this._hashFunction = hashFucntion;
  }

 getPreviousIndex(index){
   return (_getPreviousIndex(this, index));
 }
}

module.exports._inspect = _inspect;
module.exports._getPreviousIndex = _getPreviousIndex;
