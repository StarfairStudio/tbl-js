// @ts-nocheck
/** Indexes in {data} to display. Used for filtering and sorting */
const rowsToDisplay = { r: TableFast.uint32ArrayWithNumbers(1_000_000) };
const tableData = DataGen.dataGenerate(500, 20);

const tbl = TableFast.table(
	// headerDiv
	/** @type {HTMLDivElement} */
	(TableFast.getById('hdr')),
	// colRowNumDiv
	/** @type {HTMLDivElement} */
	(TableFast.getById('nums')),
	// tableDiv
	/** @type {HTMLDivElement} */
	(TableFast.getById('tbl')),
	// rowHeight
	48,
	// cell wifth
	250,
	// cols
	['Name', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'],
	// rowsCount
	1_000_000,
	// rowsData
	tableData,
	// rowsToDisplay
	rowsToDisplay
);

const worker = new Worker('worker_bundl.js');
TableFast.listen(worker, 'message', /** @param {MessageEvent<import('./worker.js').InitResponceMessageData & import('./worker.js').FilterResponceMessageData>} evt */ evt => {
	switch (evt.data[0]) {
		case 1:
			rowsToDisplay.r = evt.data[1];
			tbl.cellsFill();
			break;
		case 0:
			TableFast.arrExtend(tableData, evt.data[1]);
			tbl.cellsFill();
			break;
	}
});
worker.postMessage(([0, tableData, 999_500, 20]));

TableFast.listen(TableFast.getById('serch'), 'input', evt => {
	worker.postMessage(([1, evt.target.value.toLowerCase()]));
	tbl.scrollTop();
});

let visualViewportheight = visualViewport.height;
TableFast.listen(visualViewport, 'resize', evt => {
	const height = visualViewport.height;
	tbl.resize(height - visualViewportheight);
	visualViewportheight = height;
});
