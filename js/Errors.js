'use strict'
class MemoryDbKeyNotInDb extends Error {
}

class MemoryDbValueTooLong extends Error {
}

class MemoryDbKeyNotInBoucket extends Error {
}

class MemoryDbKeyNotFirstInBoucket extends Error {
}

class MemoryDbIndexOutOfRange extends Error {
}

class ParseHeaderInvalidInput extends Error {
}

class StoredDbNotSupportedEnv extends Error {
}

class StoredDbUpdateNodeValueTooLong extends Error {
}

module.exports.MemoryDbKeyNotInDb = MemoryDbKeyNotInDb;
module.exports.MemoryDbValueTooLong = MemoryDbValueTooLong;
module.exports.MemoryDbKeyNotInBoucket = MemoryDbKeyNotInBoucket;
module.exports.MemoryDbKeyNotFirstInBoucket = MemoryDbKeyNotFirstInBoucket;
module.exports.MemoryDbIndexOutOfRange = MemoryDbIndexOutOfRange;
module.exports.ParseHeaderInvalidInput = ParseHeaderInvalidInput;
module.exports.StoredDbNotSupportedEnv = StoredDbNotSupportedEnv;
module.exports.StoredDbUpdateNodeValueTooLong = StoredDbUpdateNodeValueTooLong;
