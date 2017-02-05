class Db {
  //
  // Db is the object that expose the localStorage API
  // For get(key) we just need to do memoryDb.key.
  // For set an item we need:
  //       1) query memoryDb for the positions in the StoredDb of the next and previous node
  //          of the node that we want to set
  //       2) serialize the item then we have to append the item to the buffer then we have to
  //       3) modify in the buffer the item's neighbors for point to the new item
  //       4) finally we update memoryDb.
  //
  cosntructor(storedDb, memoryDb, path) {
    this._storedDb = storedDb;
    this._memoryDb = memoryDb;
    this. path = path;
  }
}

function loadDb(path, environment) {
  //
  // Take a path (string) and an environment (node, mobile, browser)
  // Return new Db()
  //
  const buffer = bufferFromPath(path, environment);
  const memoryDb = bufferParser(buffer);
  return new Db(buffer, memoryDb, path);
}

function creatNewDb(path, environment) {
  //
  // Take a path (string) and an environment create a newStroedDb
  // and return new Db()
  //
}
