import { table } from './table.js';

const ROWS_COUNT = 1000000;
const rowsData = new Array(ROWS_COUNT);
for (let row = 0; row < ROWS_COUNT; row++) {
	// const ten = (row + 1) * 10;
	// rowsData[row] = [ten + 1, ten + 2, ten + 3];
	rowsData[row] = [
		row, row, row,
		row, row, row,
		row, row, row,
		row, row, row,
		row, row, row,
		row, row, row,
		row, row, row];
}

table(
	/** @type {HTMLDivElement} */(document.getElementById('tbl')),
	[
		'col1', 'col2', 'col2',
		'col1', 'col2', 'col2',
		'col1', 'col2', 'col2',
		'col1', 'col2', 'col2',
		'col1', 'col2', 'col2',
		'col1', 'col2', 'col2',
		'col1', 'col2', 'col2'
	],
	rowsData
	// [
	// 	[11, 12, 13],
	// 	[21, 22, 23],
	// 	[31, 32, 33]
	// ]
);
