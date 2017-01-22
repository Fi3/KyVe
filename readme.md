![travis tag](https://travis-ci.org/Fi3/CordovaLocalStorage.svg?branch=master)
![codecov tag](https://codecov.io/gh/Fi3/CordovaLocalStorage/coverage.svg)
#CordovaLocalStorage

##localStorgae API without the bother of the size.

###Examples:

###Data structure:

The key:value strings are saved in an hash table implemented with a linked list.
Each node is composed by: [collision flag ,next position, key, value].
* Keys are saved in the nodes for manage collisions.
* Next position is the position in byte where the next node start.
* Collision flag is one bit that is 1 if `hash(node key) == hash(next node key) AND (node key) != (next node key)` 

Keys and value are byte strings and are encoded with [RLP Recursive Length Prefix.](https://github.com/ethereum/wiki/wiki/RLP)

The db is encoded in a bytes string where the firsts 16 bytes are reserved for save the firt and last node
positions. All the following bytes are the nodes.

The first 16 bytes are the header, the header is composed by:
1. First 8 bytes = byte position of the head node encoded in big endian with leading 0. 00 00 00 00 00 00 00 01 is 1;
2. The bytes from byte 8 to byte 16 are the byte position of the tail node encoded in Be with leading 0.

The db is saved in a single file.

###Algoritm:

For work with the db we have to load the whole db in memory. Read requests are executed without system call for access the
file system. Write requests are executed directly on the file, the db
in memory memorize the key that have been add/modify and continue to respond at read request for all the keys
but the one that we are changing. When the key has been add/modified on the file, we update the db in memory.

**ADD INDEX N**
* Find N-1 position find N+1 position
* Append node to the DB, the node next position is N+1 position
* Modify N-1 node next position with the position of the added node

**REPLACE VALUE IN NODE AT INDEX N**
* If the value is <= than the value in the node -> just replace the value in the node
* If the value is > than the value in the node -> we add a new node with the above algoritm

When we replace a value in a node if the new value is bigger tha the old value, we add a new node this make the old node
an unlinked node, this leads at waste memory. We have to keep track of the unlinked nodes and when they grow run db.clear().

When we encounter a collision in writing we simply add the node. We we read we check if node key == requested key.

**ALTOGETHER**

1. db.setItem(key, value)
2. index = hash(key)
3. from the db in memory find the node at index, the node at index -1 and the node at index + 1
4. if [node at index].key != key ->
 1. append new node to the DB in the file, the node next position is [node at index -1].nextPostion
 2. modify [node at index -1].nextPostion with the position of the added node
5. if [node at index].key == key ->
 1. if [node at index].value <= value -> just replace the value in the node
 2. if [node at index].value > value -> we add a new node with the above algoritm (point 4)
6. if we have a collision ->
 1. if the collision flag is already set ->
  1. [node at index - 1] = [node at index + 1]
  2. repeat point 6
 2. will set the collision flag of [node at index -1]
 3. we add a new node with the above algoritm (point 4)
    
**PARSE DB**

1. set index = 0
2. go to next node ->
 1. if collision flag is 0 -> index++ repeat point 2
 2. if collision flag is 1 -> index++ repat point 2 but do not increment index
