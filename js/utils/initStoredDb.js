const rlp = require('rlp');

function createHeader(head,tail) {
  const buffer = Buffer.alloc(24); //jshint ignore:line
  const byteWhereHeadPositonStart = 8;
  const byteWhereTailPositonStart = 16;
  buffer.write('KyVeKyVe', 0, 'ascii');  //magic
  buffer.write(head, byteWhereHeadPositonStart, 'hex');
  buffer.write(tail, byteWhereTailPositonStart, 'hex');
  return buffer;
}

function createNode(data) {
  const collisionFlag = Buffer.alloc(1);
  if (data.collisionFlag === 0) {
    collisionFlag.write('00', 0, 'hex');
  }
  else if (data.collisionFlag === 1) {
    collisionFlag.write('10', 0, 'hex');
  }
  else {
    throw UnimplementedError;
  }
  const nextNode = Buffer.alloc(8);
  nextNode.write(data.nextNode, 0, 'hex');
  const key = rlp.encode(data.key);
  const value = rlp.encode(data.value);
  return Buffer.concat([collisionFlag, nextNode, key, value]);
}
const dataNode1 = {
  collisionFlag: 0,
  nextNode: '000000000000002C', // 24 + node1Len
  key: 'cane', // rlp encoded is 5 bytes
  value: 'gatto', // rlp encoded is 6 bytes
};
const dataNode2 = {
  collisionFlag: 0,
  nextNode: '0000000000000040', // 24 + node1Len + node2Len
  key: 'cana', // rlp encoded is 5 bytes
  value: 'gatto', // rlp encoded is 6 bytes
};
const dataNode3 = {
  collisionFlag: 0,
  nextNode: '0000000000000000', // 0 becaouse is tail
  key: 'cani', // rlp encoded is 5 bytes
  value: 'gatto', // rlp encoded is 6 bytes
};

// CREATE A BUFFER THAT RAPRESENT A DB WiTH THE THREE NODES ABOVE
const nodeLen = 1 + 8 + 5 + 6; // collisionFlag + nextNodePosition + key + value
const head = '0000000000000018'; // 24
const tail = '0000000000000040'; // 24 + nodeLen + nodeLen
const header = createHeader(head, tail);
const node1 = createNode(dataNode1);
const node2 = createNode(dataNode2);
const node3 = createNode(dataNode3);
const storedDb = Buffer.concat([header, node1, node2, node3]);

module.exports.initializedDb = storedDb;
module.exports.createNode = createNode;
