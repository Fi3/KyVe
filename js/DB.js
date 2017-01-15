function _inspect(key, memoryDb, hashFucntion) {
  // key is a string, memoryDb is the object that we get from load the db in memory
  // hashFucntion is the function that I use for hashing
  // return {index, getPreviousIndexPosition, nextNodePosition, alreadyInDb, collisions}
  // collisions is int, number of collisions
  const index = hashFucntion(key);
  const node = memoryDb._nodes[index];
  const prevIndex = _getPreviousIndex(memoryDb, index);
  const prevNode = memoryDb._nodes[prevIndex];
  if (node === undefined) {
    return {
      normalizedIndex: prevNode.normalizedIndex + 1,
      previousNodePosition: prevNode.position,
      nextNodePosition: prevNode.nextPosition,
      alreadyInDb: false,
      collisions: 0,
    };
  }
}

function _getPreviousIndex(memoryDb, indexSerched) {
  // iterate memoryDb key and when key > indexSerched return the key before
  const nodes = memoryDb._nodes;
  const header = memoryDb._header;
  for (const actualIndex in nodes) {
    const previousIndex = nodes[actualIndex].previousIndex;
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
