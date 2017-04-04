const db = require('../../../js/Db.js');

function genRandomVal() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 20; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

const Db = db.createNewDb('./provabig', 'node');
const plainObject = {};

function plainObjectTest(db) {
	let nanoSeconds = 0;
	for (let x = 0; x < 11; x++){
	  const key = genRandomVal();
	  const value = genRandomVal();
	  const start = process.hrtime();
	  plainObject[key] = value;
	  const stop = process.hrtime();
		nanoSeconds = nanoSeconds + (stop[1] - start[1]);
	}
	console.log((nanoSeconds/10)/1000000);
}

function kyveTest(db) {
	let nanoSeconds = 0;
	for (let x = 0; x < 1001; x++){
		const key = genRandomVal();
		const value = genRandomVal();
		const start = process.hrtime();
		db.setItem(key, value);
		const delta = process.hrtime(start);
		if (delta[1] < 0){
			console.log(delta);
		}
		nanoSeconds = nanoSeconds + delta[1];
	}
	console.log((nanoSeconds/1000)/1000000);
}

plainObjectTest({});
kyveTest(Db);
