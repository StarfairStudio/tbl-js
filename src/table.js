import { div, listen, setStyles } from './utils.js';

const MAX_HEIGHT_PX = 15000000;

/**
 * @param {HTMLDivElement} tableDiv
 * @param {number} rowHeight
 * @param {number} cellWidth // TODO: diffenrent col width
 * @param {string[]} cols
 * @param {any[][]} rowsData
 */
export const table = (tableDiv, rowHeight, cellWidth, cols, rowsData) => {
	//
	// read dom

	const viewPortHeight = tableDiv.clientHeight;
	const rowsCountViewPort = Math.ceil(viewPortHeight / rowHeight) + 1;
	const allRowsHeight = rowsData.length * rowHeight;
	const scrolHeight = Math.min(allRowsHeight, MAX_HEIGHT_PX);

	//
	// wright dom

	const [contentDiv, overlayDiv] = tableCreate(
		tableDiv,
		// tableDivHeight
		viewPortHeight,
		// scrollDivHeight
		scrolHeight,
		// scrollDivWidth
		cellWidth * cols.length
	);

	const cels = rowsCreate(contentDiv, cols.length, rowsCountViewPort);

	/** @param {number} fromRowsDataIndex */
	const _cellsFill = fromRowsDataIndex => cellsFill(cels, rowsData, fromRowsDataIndex);
	_cellsFill(0);

	//
	// scroll

	let scrollTop = 0;
	let scrollLeft = 0;

	{
		// if {allRowsHeight} > 15 million -> we have to applay koef on scroll
		// if {allRowsHeight} <= 15 million -> {scrollYKoef} = 1
		const scrollYKoef = (allRowsHeight - viewPortHeight) / (scrolHeight - viewPortHeight);
		let topRowDataIndex = 0;
		listen(overlayDiv, 'scroll', /** @param {Event & {target:HTMLDivElement}} evt */ evt => {
			scrollTop = evt.target.scrollTop * scrollYKoef;
			scrollLeft = evt.target.scrollLeft;
			topRowDataIndex = Math.trunc(scrollTop / rowHeight);

			contentDiv.style.transform = `translate(${-scrollLeft}px, ${-scrollTop % rowHeight}px)`;
			_cellsFill(topRowDataIndex);
		});
	}

	listen(overlayDiv, 'click', /** @param {MouseEvent & {target:HTMLDivElement}} evt */ evt => {
		const rowsDataIndex = Math.trunc(
			// evt.offsetY - overlayDiv.scrollTop = position in table viewPort
			(scrollTop + evt.offsetY - overlayDiv.scrollTop) / rowHeight
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
	const contentDiv = div();
	setStyles(contentDiv, { width: `${scrollDivWidth}px` });

	const overlayDiv = div();
	setStyles(overlayDiv, {
		height: `${tableDivHeight}px`,
		width: '100%',
		overflow: 'auto',
		position: 'absolute',
		top: '0',
		// @ts-ignore
		scrollbarWidth: 'thin'
	});

	const scrollDiv = div();
	setStyles(scrollDiv, {
		height: `${scrollDivHeight}px`,
		width: `${scrollDivWidth}px`
	});
	overlayDiv.append(scrollDiv);

	tableDiv.append(contentDiv, overlayDiv);

	return [contentDiv, overlayDiv];
};

/**
 * @param {HTMLDivElement[][]} cellsDivs
 * @param {any[][]} rowsData
 * @param {number} fromRowsDataIndex
 */
const cellsFill = (cellsDivs, rowsData, fromRowsDataIndex) => {
	let row = 0;
	for (; fromRowsDataIndex < rowsData.length && row < cellsDivs.length; fromRowsDataIndex++, row++) {
		const rowData = rowsData[fromRowsDataIndex];
		cellsDivs[row].forEach((cellDiv, col) => {
			cellDiv.textContent = rowData[col];
		});
		cellsDivs[row][0].parentElement.style.display = 'flex';
	}

	for (; row < cellsDivs.length; row++) {
		cellsDivs[row][0].parentElement.style.display = 'none';
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
