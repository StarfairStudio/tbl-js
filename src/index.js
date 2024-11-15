import { dataGenerate } from './data-generator.js';
import { table } from './table.js';
import { arrExtend, listen } from './utils.js';

const data = dataGenerate(500, 20);

const worker = new Worker(new URL('worker.js', import.meta.url), { type: 'module' });
listen(worker, 'message', /** @param {MessageEvent<any[][]>} evt */ evt => arrExtend(data, evt.data));
worker.postMessage([0, data, 999500, 20]);

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
