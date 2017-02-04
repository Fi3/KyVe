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

module.exports.NodeHook = NodeHook;
// ---------ONLY---FOR---TEST--------------------
module.exports._slice = _slice;
module.exports._write = _write;
