'use strict'
const fs = require('fs');
const initStoredDb = require('./utils/initStoredDb.js');

class NodeHook {
  //
  // Node hook for read and write the file where is stroed the db when the enviornment is Node
  //
  constructor(path) {
    this._path = path;
    this._fileDescriptor = fs.openSync(path, 'r+');
  }

  slice(start, end) {
    return _slice(this, start, end);
  }

  close() {
    fs.closeSync(this._fileDescriptor);
  }

  write(buffer, offset) {
    return _write(this, buffer, offset);
  }

  length() {
    return _length(this);
  }

  append(buffer) {
    return _append(this, buffer);
  }
}

function _slice(NodeHook, start, end) {
  //
  // Return a buffer that start at file's byte position start at end at file's byte position end
  //
  const length = end - start;
  const data = Buffer.allocUnsafe(length);
  fs.readSync(NodeHook._fileDescriptor, data, 0, length, start);
  return data;
}

function _write(NodeHook, buffer, offset) {
  //
  // Write buffer  on file at offset
  //
  if (isNaN(offset)) {
    throw new Error;
  }
  fs.writeSync(NodeHook._fileDescriptor, buffer, 0, buffer.length, offset);
  return buffer;
}

function _length(NodeHook) {
  //
  // Return the StoredDb's length in byte
  //
  const len = fs.statSync(NodeHook._path).size;
  return len;
}

function _append(NodeHook, buffer, test) {
  //
  // Append buffer to StroedDb
  // We open the use write instead of append so we can have just one file decriptor
  // in r+ we do not need to append becaouse it will be write syncronously,
  // all the operations that chang datas in KyVe are syncrounus
  //
  let len;
  if (test === true) {
    len = 100;
  }
  else {
    len = _length(NodeHook);
  }
  fs.writeSync(NodeHook._fileDescriptor, buffer, 0, buffer.length, len);
  return buffer;
}

function init(path) {
  //
  // Append buffer to StroedDb
  //
  const newDb = fs.openSync(path, 'w');
  const buffer = initStoredDb.initializedDb;
  fs.writeSync(newDb, buffer, 0, buffer.length, 0);
  fs.closeSync(newDb);
  return path;
}

module.exports.NodeHook = NodeHook;
module.exports.init = init;
// ---------ONLY---FOR---TEST--------------------
module.exports._slice = _slice;
module.exports._write = _write;
module.exports._length = _length;
module.exports._append = _append;
