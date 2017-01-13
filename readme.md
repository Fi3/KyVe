#CordovaLocalStorage

###localStorgae API without the bother of the size.

###Examples:

###Data structure:
The db is holded in memory so we need the file system just for write/delete data.
When we upload the db in memory we map each element to the position in the file so the
write time is O(1)

* hash(key) = index
* file(0) = length firs element
* file(0 + length first element) = lengh second elment
* ...
* file(0 + , ..., lenght index -1 element) = lenght index element

We implement the has table with a pseudo linked list so we have a series of linked node, and each node is:
[lenght of the node, value] if the node do not have value we have [number of following nodes that do not have
a value]

We need to have 2 kind of nodes (with and without value) for save space between nodes, for example if our index
is 5 byte we can save something like ~10^12 node. In the case that we have to save just the value that
correspond to the biggest index (0xffffffffff) we would need ~10^12(tera) bytes just for the void nodes.

00, 00, 00, ..10^12 times.. ,lenghtOfMyValue,myValue

* bit1 = is lenght?
* bit2 = if bit1 is lenght: the lenght fit in the next 4 bites?

If is lenght and lenght < 16 we have:

* bit1 = 1
* bit2 = 1
* bit3 = lenght
* bit4 = length
* bit5 = length
* bit6 = length
* bit7 = nothing
* bit8 = nothing

If is lenght and lenght 15 < 16384 we have:

* bit1 = 1
* bit2 = 0
* bit3 = lenght
* bit4 = length
* bit5 = length
* bit6 = length
* bit7 = length
* bit8 = length

* bit1 = length
* bit2 = length
* bit3 = lenght
* bit4 = length
* bit5 = length
* bit6 = length
* bit7 = length
* bit8 = length

If is not length we have the same structure but we use the bits 3 -> 5 or 3 -> 5 and 1 -> 8 for denote
the number of void nodes that we have between the current node and the next node with a value or the next node
without a value if this number is bigger than 16383.
Now in the precedent case of index = 0xffffffffff we need ~6.7 MB of void nodes.
