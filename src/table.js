import { div, listen, setStyles } from './utils.js';

const MAX_HEIGHT_PX = 15000000;

/**
 * @param {HTMLDivElement} tableDiv
 * @param {string[]} cols
 * @param {any[][]} rowsData
 */
export const table = (tableDiv, cols, rowsData) => {
	// TODO: remove hardcode
	const ROW_HEIGHT_PX = 20;
	const CELL_WITH_PX = 100;

	//
	// read dom

	const viewPortHeight = tableDiv.clientHeight;
	const viewPortWidth = tableDiv.clientWidth;
	const rowsCountViewPort = Math.ceil(viewPortHeight / ROW_HEIGHT_PX) + 1;
	const allRowsHeight = rowsData.length * ROW_HEIGHT_PX;
	const scrolHeight = Math.min(allRowsHeight, MAX_HEIGHT_PX);

	//
	// wright dom

	const [contentDiv, overlayDiv] = tableCreate(
		tableDiv,
		// tableDivHeight
		viewPortHeight,
		// tableDivWidth
		viewPortWidth,
		// scrollDivHeight
		scrolHeight,
		// scrollDivWidth
		CELL_WITH_PX * cols.length
	);

	const cels = rowsCreate(contentDiv, cols.length, rowsCountViewPort);

	/** @param {number} fromRowsDataIndex */
	const _cellsFill = fromRowsDataIndex => cellsFill(cels, rowsData, fromRowsDataIndex);
	_cellsFill(0);

	//
	// scroll

	let scrollTop = 0;

	/** @type {(scrlTop:number)=>number} */
	const scrollTopCalc = allRowsHeight <= MAX_HEIGHT_PX
		? scrlTop => scrlTop
		// If the height is more than 15 million.
		// This function is also suitable if the height is less than 15 million - but it makes unnecessary calculations
		: scrlTop => scrlTop / (scrolHeight - viewPortHeight) * (allRowsHeight - viewPortHeight);

	listen(overlayDiv, 'scroll', /** @param {Event & {target:HTMLDivElement}} evt */ evt => {
		scrollTop = scrollTopCalc(evt.target.scrollTop);
		const translateY = -scrollTop % ROW_HEIGHT_PX;
		const rowsDataIndex = Math.trunc(scrollTop / ROW_HEIGHT_PX);
		const scrollLeft = evt.target.scrollLeft;

		contentDiv.style.transform = `translate(${-scrollLeft}px, ${translateY}px)`;
		_cellsFill(rowsDataIndex);
	});

	listen(overlayDiv, 'click', /** @param {MouseEvent & {target:HTMLDivElement}} evt */ evt => {
		// TODO: fix incorrect index when height is more than 15 million
		// const rowsDataIndex = Math.trunc((scrollTop + evt.offsetY) / ROW_HEIGHT_PX);
		const rowsDataIndex = Math.trunc(evt.offsetY / ROW_HEIGHT_PX);

		console.log(rowsDataIndex);
	});
};

/**
 * @param {HTMLDivElement} tableDiv
 * @param {number} tableDivHeight
 * @param {number} tableDivWidth
 * @param {number} scrollDivHeight
 * @param {number} scrollDivWidth
 */
const tableCreate = (tableDiv, tableDivHeight, tableDivWidth, scrollDivHeight, scrollDivWidth) => {
	const contentDiv = div();
	setStyles(contentDiv, { width: `${scrollDivWidth}px` });

	const overlayDiv = div();
	setStyles(overlayDiv, {
		height: `${tableDivHeight}px`,
		width: `${tableDivWidth}px`,
		overflow: 'auto',
		position: 'absolute',
		top: '0'
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
