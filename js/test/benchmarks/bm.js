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

function plainObjectTest(db, iteration) {
	let nanoSeconds = 0;
	let nanoSeconds1 = 0;
	const keys = [];
	for (let x = 0; x < iteration + 1; x++){
	  const key = genRandomVal();
		keys.push(key);
	  const value = genRandomVal();
	  const start = process.hrtime();
	  plainObject[key] = value;
	  const stop = process.hrtime();
		nanoSeconds = nanoSeconds + (stop[1] - start[1]);
	}
	for (let x = 0; x < iteration + 1; x++){
		const start = process.hrtime();
		const value = db[keys[x]];
		const delta = process.hrtime(start);
		nanoSeconds1 = nanoSeconds1 + delta[1];
	}
	console.log('plain object write', (nanoSeconds/iteration)/1000000);
	console.log('plain object read', (nanoSeconds1/iteration)/1000000);
}

function kyveTest(db, iteration) {
	let nanoSeconds = 0;
	let nanoSeconds1 = 0;
	const keys = [];
	for (let x = 0; x < iteration + 1; x++){
		const key = genRandomVal();
		keys.push(key);
		const value = genRandomVal();
		const start = process.hrtime();
		db.setItem(key, value);
		const delta = process.hrtime(start);
		nanoSeconds = nanoSeconds + delta[1];
	}
	let values = [];
	for (let x = 0; x < iteration + 1; x++){
		const start = process.hrtime();
		const value = db.getItem(keys[x]);
		const delta = process.hrtime(start);
		nanoSeconds1 = nanoSeconds1 + delta[1];
		values.push(value);
	}
	console.log('kyve write', (nanoSeconds/iteration)/1000000);
	console.log('kyve read', (nanoSeconds1/iteration)/1000000);
}


plainObjectTest({}, 1000);
kyveTest(Db, 1000);
