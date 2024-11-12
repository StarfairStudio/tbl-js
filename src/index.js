import { table } from './table.js';

const ROWS_COUNT = 1000000;
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
	// headerDiv
	/** @type {HTMLDivElement} */(document.getElementById('hdr')),
	// colRowNumDiv
	/** @type {HTMLDivElement} */(document.getElementById('nums')),
	// tableDiv
	/** @type {HTMLDivElement} */(document.getElementById('tbl')),
	// rowHeight
	48,
	// cell wifth
	100,
	// cols
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
