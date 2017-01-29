const fs = require('fs');

class NodeHook {
  // Node hook for read and write the file where is stroed the db when the enviornment is Node
  constructor(path) {
    this._path = path;
    this._fileDescriptor = fs.openSync(path, 'r+');
  }

  slice(start, end) {
    return _slice(this, start, end);
  }

  close() {
    //close file
  }
//fs.writeSync(fd, buffer2, 0, 2, 5);
}

function _slice(NodeHook, start, end) {
  // return a buffer that start at file's byte start at end at file's byte end
  const length = end - start + 1;
  const data = new Buffer(length);
  fs.readSync(NodeHook._fileDescriptor, data, 0, length, start);
  return data;
}

module.exports.NodeHook = NodeHook;
// ---------ONLY---FOR---TEST--------------------
module.exports._slice = _slice;
