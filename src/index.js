import { table } from './table.js';

const ROWS_COUNT = 100; // 1000000;
const rowsData = new Array(ROWS_COUNT);
for (let row = 0; row < ROWS_COUNT; row++) {
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
);
