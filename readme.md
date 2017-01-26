#KyVe ![travis tag](https://travis-ci.org/Fi3/KyVe.svg?branch=master) ![codecov tag](https://codecov.io/gh/Fi3/KyVe/coverage.svg)


###A simple in memory key-value datastore with persistence.

KyVe is as really simple hybrid key-value storage. Hybrid because maintain 2 db, one in memory, a symple JS Object, the other one is
stored. Get a value is the same thing that get a value from a JS Object. When we have to set a value we write on the stored db and than 
we update the one in memory. All the byte's position of the key:value elements (nodes) in the stored db are saved in memory.
When we have to write the stored db we know exactly the byte position of the node don't need to parse the db every time that we .set(k:v)

The goal is to have a sobstitute for LocalStorage on Node and Cordova without the size limit and not too slow.
