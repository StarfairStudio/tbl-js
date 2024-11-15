import { dataGenerate } from './data-generator.js';
import { arrExtend } from './utils.js';

const data = [];

/** @param {MessageEvent<[number, any[][], number, number]>} evt */
onmessage = function (evt) {
	switch (evt.data[0]) {
		case 0: dataInit(evt.data[1], evt.data[2], evt.data[3]);
			break;
	}
};

/** @param {any[][]} initData, @param {number} rowsCount, @param {number} colCount */
const dataInit = (initData, rowsCount, colCount) => {
	const CHUNK_SIZE = 10000;

	arrExtend(data, initData);
	const chunkFullCount = Math.trunc(rowsCount / CHUNK_SIZE);
	const post = /** @param {number} rwCount */ rwCount => postMessage(dataGenerate(rwCount, colCount));

	for (let ii = 0; ii < chunkFullCount; ii++) {
		post(CHUNK_SIZE);
	}

	post(rowsCount - chunkFullCount * CHUNK_SIZE);
};
