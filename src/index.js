import { dataGenerate } from './data-generator.js';
import { table } from './table.js';

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
	250,
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
	// rowsData
	dataGenerate(1000000, 21)
);
