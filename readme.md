<img src="https://cdn.rawgit.com/Fi3/KyVe/9d38df69/KyVe_logo.svg" width="500">

# KyVe ![travis tag](https://travis-ci.org/Fi3/KyVe.svg?branch=master) ![codecov tag](https://codecov.io/gh/Fi3/KyVe/coverage.svg)


### A simple in memory key-value datastore with persistence.

KyVe is as really simple hybrid key-value storage. Hybrid because maintain 2 db, one in memory, a symple JS Object, the other one is
stored. Get a value is the same thing that get a value from a JS Object. When we have to set a value we write on the stored db and than 
we update the one in memory. All the byte's position of the key:value elements (nodes) in the stored db are saved in memory.
When we have to write the stored db we know exactly the byte position of the node don't need to parse the db every time that we .set(k:v)

The goal is to have a sobstitute for LocalStorage on Node and Cordova without the size limit and not too slow.

* [KyVe Dump File Format](https://github.com/Fi3/KyVe/wiki/KyVe-Dump-File-Format)
* [KyVe in memory datastore](https://github.com/Fi3/KyVe/wiki/KyVe-in-memory-datastore)

### API (for now work only in Node.js)

#### Create new db

```javascript
const db = require('./js/Db.js')
const Db = db.createNewDb('./mydb.kyy', 'node')
```

#### Load db from file

```javascript
const db = require('./js/Db.js')
const Db = db.loadDb('./mydb.kyy', 'node')
```

#### Set and get keys

```javascript
const db = require('./js/Db.js')
const Db = db.loadDb('./mydb.kyy', 'node')

Db.setItem('key', 'value')
Db.getItem('key') === value // -> true
```

### Benchmark

`node ./js/test/bm.js`

Result for 1000 keys db and values length 20 results in ms

```
plain object write 0.002952004
plain object read 0.000877038
kyve write 1.605172033  // this value grow linerly with the db dimension TODO fix that
kyve read 0.0010263170000000001 
```

### TODO

1. if I set key `x` to `value1` than I can not set key `x` to `value2` if `value2` < `value1` [ref](https://github.com/Fi3/KyVe/blob/master/js/Db.js#L79)
2. when we change a value for key `x` if the new value is bigger we append a new node at the end of the stroedDb and we make an hole in the file we should have a function that remove the holes
3. the goal of this db is to be fast in reading but we need better performance in writing
