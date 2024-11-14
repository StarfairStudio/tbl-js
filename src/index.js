// import { dataEmptyGenerate, dataFill } from './data-generator.js';
import { dataGenerate } from './data-generator.js';
import { table } from './table.js';
import { arrExtend } from './utils.js';

const data = dataGenerate(500, 20);
setTimeout(() => arrExtend(data, dataGenerate(999500, 20)), 100);

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
	// rowsCount
	1000000,
	data
);
