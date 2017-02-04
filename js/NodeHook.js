const fs = require('fs');

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
}

function _slice(NodeHook, start, end) {
  //
  // Return a buffer that start at file's byte position start at end at file's byte position end
  //
  const length = end - start + 1;
  const data = Buffer.allocUnsafe(length);
  fs.readSync(NodeHook._fileDescriptor, data, 0, length, start);
  return data;
}

function _write(NodeHook, buffer, offset) {
  //
  // Write buffer  on file at offset 
  //
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

function _append(NodeHook, buffer) {
  //
  // Append buffer to StroedDb
  // We open the use write instead of append so we can have just one file decriptor in r+
  // we do not need append becaouse the will be write syncronously, all the operations that change
  // datas in KyVe are syncrounus
  //
  const len = NodeHook._length(NodeHook);
  fs.writeSync(NodeHook._fileDescriptor, buffer, 0, buffer.length, len);
  return buffer;
}

module.exports.NodeHook = NodeHook;
// ---------ONLY---FOR---TEST--------------------
module.exports._slice = _slice;
module.exports._write = _write;
module.exports._length = _length;
module.exports._append = _append;
