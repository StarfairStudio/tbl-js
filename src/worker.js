import { dataGenerate } from './data-generator.js';

/** @param {MessageEvent<[number, number]>} evt */
onmessage = function (evt) {
	const CHUNK_SIZE = 10000;

	const rowsCount = evt.data[0];
	const colCount = evt.data[1];
	const chunkFullCount = Math.trunc(rowsCount / CHUNK_SIZE);
	const post = /** @param {number} rwCount */ rwCount => postMessage(dataGenerate(rwCount, colCount));

	for (let ii = 0; ii < chunkFullCount; ii++) {
		post(CHUNK_SIZE);
	}

	post(rowsCount - chunkFullCount * CHUNK_SIZE);
};
