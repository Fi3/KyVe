#KyVe ![travis tag](https://travis-ci.org/Fi3/KyVi.svg?branch=master) ![codecov tag](https://codecov.io/gh/Fi3/KyVe/coverage.svg)


###A simple in memory key-value datastore with persistence.

KyVe is as really simple hybrid key-value storage. Hybrid because maintain 2 db, one in memory, a symple JS Object, the other one is
stored. Get a value is the same thing that get a value from a JS Object. When we have to set a value we write on the stored db and than 
we update the one in memory. All the byte's position of the key:value element in the stored db are saved in memory so when we have to
write the stored db we do not need to parse the stored db.

The goal is to have a sobstitute for LocalStorage on Node and Cordova without the size limit and not too slow.
