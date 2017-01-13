function getEnvironment() {
  // return cordova or node
}

var fd = fs.openSync(path.join(process.cwd(), 'myBinaryFile'), 'w');
fs.writeSync(fd, buffer2, 0, 2, 5);
