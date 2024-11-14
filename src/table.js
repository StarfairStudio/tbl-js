import { div, divWithContent, divWithStyles, listen } from './utils.js';

const MAX_HEIGHT_PX = 15000000;

/**
 * @param {HTMLDivElement} headerDiv
 * @param {HTMLDivElement} numsDiv
 * @param {HTMLDivElement} tableDiv
 * @param {number} rowHeight
 * @param {number} cellWidth // TODO: diffenrent col width
 * @param {string[]} cols
 * @param {number} rowsCount
 * @param {any[][]} rowsData
 */
export const table = (headerDiv, numsDiv, tableDiv, rowHeight, cellWidth, cols, rowsCount, rowsData) => {
	let topRowDataIndex = 0;

	//
	// read dom

	const viewPortHeight = tableDiv.clientHeight;
	const rowsCountViewPort = Math.ceil(viewPortHeight / rowHeight) + 1;
	const allRowsHeight = rowsCount * rowHeight;
	const scrolHeight = Math.min(allRowsHeight, MAX_HEIGHT_PX);

	//
	// wright dom

	// header
	headerDiv.append(...cols.map(col => divWithContent(col, 'hdr')));

	// table main content

	const [tableContentDiv, tableOverlayDiv] = tableCreate(
		tableDiv,
		// tableDivHeight
		viewPortHeight,
		// scrollDivHeight
		scrolHeight,
		// scrollDivWidth
		cellWidth * cols.length
	);
	const tableCells = rowsCreate(tableContentDiv, cols.length, rowsCountViewPort);
	const _tableCellsFill = () => tableCellsFill(tableCells, rowsData, topRowDataIndex);
	_tableCellsFill();

	// nums column

	const numsContentDiv = numsColCreate(numsDiv, viewPortHeight);
	const numsCels = numsCellsCreate(numsContentDiv, rowsCountViewPort);
	const _numsCellsFill = () => numsCellsFill(numsCels, topRowDataIndex, rowsCount);
	_numsCellsFill();

	//
	// scroll

	let scrollTop = 0;
	let scrollLeft = 0;

	{
		// if {allRowsHeight} > 15 million -> we have to applay koef on scroll
		// if {allRowsHeight} <= 15 million -> {scrollYKoef} = 1
		const scrollYKoef = (allRowsHeight - viewPortHeight) / (scrolHeight - viewPortHeight);
		let translateY = 0;
		listen(tableOverlayDiv, 'scroll', /** @param {Event & {target:HTMLDivElement}} evt */ evt => {
			scrollTop = evt.target.scrollTop * scrollYKoef;
			scrollLeft = -evt.target.scrollLeft;
			topRowDataIndex = Math.trunc(scrollTop / rowHeight);
			translateY = -scrollTop % rowHeight;

			headerDiv.style.transform = `translateX(${scrollLeft}px)`;
			tableContentDiv.style.transform = `translate(${scrollLeft}px, ${translateY}px)`;
			_tableCellsFill();

			numsContentDiv.style.transform = `translateY(${translateY}px)`;
			_numsCellsFill();
		});
	}

	listen(tableOverlayDiv, 'click', /** @param {MouseEvent & {target:HTMLDivElement}} evt */ evt => {
		const rowsDataIndex = Math.trunc(
			// evt.offsetY - overlayDiv.scrollTop = position in table viewPort
			(scrollTop + evt.offsetY - tableOverlayDiv.scrollTop) / rowHeight
		);
		console.log(rowsDataIndex);
	});
};

/**
 * @param {HTMLDivElement} tableDiv
 * @param {number} tableDivHeight
 * @param {number} scrollDivHeight
 * @param {number} scrollDivWidth
 */
const tableCreate = (tableDiv, tableDivHeight, scrollDivHeight, scrollDivWidth) => {
	const contentDiv = divWithStyles({ height: `${tableDivHeight}px`, width: `${scrollDivWidth}px` });
	const overlayDiv = divWithStyles({
		height: `${tableDivHeight}px`,
		width: '100%',
		overflow: 'auto',
		position: 'absolute',
		top: '0',
		// @ts-ignore
		scrollbarWidth: 'thin'
	});

	const scrollDiv = divWithStyles({ height: `${scrollDivHeight}px`, width: `${scrollDivWidth}px` });
	overlayDiv.append(scrollDiv);

	tableDiv.append(contentDiv, overlayDiv);

	return [contentDiv, overlayDiv];
};

/**
 * @param {HTMLDivElement[][]} tableCells
 * @param {any[][]} rowsData
 * @param {number} fromRowsDataIndex
 */
const tableCellsFill = (tableCells, rowsData, fromRowsDataIndex) => {
	let row = 0;
	for (; fromRowsDataIndex < rowsData.length && row < tableCells.length; fromRowsDataIndex++, row++) {
		const rowData = rowsData[fromRowsDataIndex];
		tableCells[row].forEach((cellDiv, col) => {
			cellDiv.textContent = rowData[col];
		});
		tableCells[row][0].parentElement.style.display = 'flex';
	}

	for (; row < tableCells.length; row++) {
		tableCells[row][0].parentElement.style.display = 'none';
	}
};

/** @param {HTMLDivElement} cntDiv, @param {number} colsCount, @param {number} rowsCount */
const rowsCreate = (cntDiv, colsCount, rowsCount) => {
	/** @type {Array<HTMLDivElement[]>} */
	const cells = new Array(rowsCount);

	for (let row = 0; row < rowsCount; row++) {
		/** @type {HTMLDivElement[]} */
		const rowCels = cells[row] = new Array(colsCount);
		const rowDiv = div('rw');

		for (let col = 0; col < colsCount; col++) {
			const cellDiv = rowCels[col] = div('cl');
			rowDiv.append(cellDiv);
		}

		cntDiv.append(rowDiv);
	}

	return cells;
};

/**
 * @param {HTMLDivElement} numsDiv
 * @param {number} numsDivHeight
 */
const numsColCreate = (numsDiv, numsDivHeight) => {
	const contentDiv = divWithStyles({ height: `${numsDivHeight}px` });
	numsDiv.append(contentDiv);
	return contentDiv;
};

/**
 * @param {HTMLDivElement} numsDiv
 * @param {number} rowsCount
 */
const numsCellsCreate = (numsDiv, rowsCount) => {
	/** @type {HTMLDivElement[]} */
	const cells = [];

	for (let row = 0; row < rowsCount; row++) {
		cells.push(div('nums-rw'));
	}

	numsDiv.append(...cells);
	return cells;
};

/**
 * @param {HTMLDivElement[]} numsCells
 * @param {number} fromRowsDataIndex
 * @param {number} rowsCount
 */
const numsCellsFill = (numsCells, fromRowsDataIndex, rowsCount) => {
	fromRowsDataIndex++;
	let row = 0;
	for (; fromRowsDataIndex <= rowsCount && row < numsCells.length; fromRowsDataIndex++, row++) {
		numsCells[row].textContent = '' + fromRowsDataIndex;
		numsCells[row].style.display = null;
	}

	for (; row < numsCells.length; row++) {
		numsCells[row].style.display = 'none';
	}
};
