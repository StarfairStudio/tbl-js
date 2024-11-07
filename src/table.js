import { div, listen } from './utils.js';

const MAX_HEIGHT_PX = 15000000;

/**
 * @param {HTMLDivElement} tblDiv
 * @param {string[]} cols
 * @param {any[][]} rowsData
 */
export const table = (tblDiv, cols, rowsData) => {
	const ROW_HEIGHT = 20;

	//
	// read dom

	const cntDiv = /** @type {HTMLDivElement} */(document.getElementById('cnt'));
	const viewPortHeight = tblDiv.clientHeight;
	const rowsCountViewPort = Math.ceil(viewPortHeight / ROW_HEIGHT) + 1;
	const allRowsHeight = rowsData.length * ROW_HEIGHT;
	const scrolHeight = Math.min(allRowsHeight, MAX_HEIGHT_PX);

	//
	// wright dom

	document.getElementById('scr').style.height = `${scrolHeight}px`;
	const cels = rowsCreate(cntDiv, cols.length, rowsCountViewPort);

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

	listen(tblDiv, 'scroll', /** @param {Event & {target:HTMLDivElement}} evt */ evt => {
		scrollTop = scrollTopCalc(evt.target.scrollTop);
		const translateY = -scrollTop % ROW_HEIGHT;
		const rowsDataIndex = Math.trunc(scrollTop / ROW_HEIGHT);

		cntDiv.style.transform = `translateY(${translateY}px)`;
		_cellsFill(rowsDataIndex);
	});

	listen(tblDiv, 'click', /** @param {MouseEvent & {target:HTMLDivElement}} evt */ evt => {
		const rowsDataIndex = Math.trunc((scrollTop + evt.offsetY) / ROW_HEIGHT);
		console.log(rowsDataIndex);
	});
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
