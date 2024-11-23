import { div, divWithContent, divWithStyles, listen, stylesSet } from './utils.js';

const MAX_HEIGHT_PX = 15_000_000;

/**
 * @param {HTMLDivElement} headerDiv
 * @param {HTMLDivElement} numsDiv
 * @param {HTMLDivElement} tableDiv
 * @param {number} rowHeight
 * @param {number} cellWidth // TODO: different col width
 * @param {string[]} cols
 * @param {number} rowsCount
 * @param {any[][]} rowsData
 * @param {{r:Uint32Array}} rowsToDisplay
 */
export const table = (headerDiv, numsDiv, tableDiv, rowHeight, cellWidth, cols, rowsCount, rowsData, rowsToDisplay) => {
	let topRowDataIndex = 0;

	//
	// read dom

	let viewPortHeight = tableDiv.clientHeight;
	const allRowsHeight = rowsCount * rowHeight;
	const scrolHeight = Math.min(allRowsHeight, MAX_HEIGHT_PX);

	const scrollYKoefCalc = () =>
		// if {allRowsHeight} > 15 million -> we have to applay koef on scroll
		// if {allRowsHeight} <= 15 million -> {scrollYKoef} = 1
		(allRowsHeight - viewPortHeight) / (scrolHeight - viewPortHeight);
	let scrollYKoef = scrollYKoefCalc();

	const rowsCountViewPortCalc = () => Math.ceil(viewPortHeight / rowHeight) + 1;
	let rowsCountViewPort = rowsCountViewPortCalc();

	//
	// wright dom

	// header
	headerDiv.append(...cols.map(col => divWithContent(col, 'hdr')));

	// table main content

	const [tableContentDiv, tableOverlayDiv] = tableCreate(
		tableDiv,
		// viewPortHeight
		viewPortHeight,
		// scrollDivHeight
		scrolHeight,
		// scrollDivWidth
		cellWidth * cols.length
	);
	const numsContentDiv = numsColCreate(numsDiv, viewPortHeight);

	/** @type {Array<HTMLDivElement[]>} */ const tableCells = [];
	/** @type {HTMLDivElement[]} */	const numsCels = [];

	/** @param {number} rowsToAdd */
	const rowsAdd = rowsToAdd => {
		tableCellsAdd(tableCells, tableContentDiv, cols.length, rowsToAdd);
		numCellsAdd(numsCels, numsContentDiv, rowsToAdd);
	};
	rowsAdd(rowsCountViewPort);

	const cellsFill = () => {
		tableCellsFill(tableCells, rowsData, rowsToDisplay, topRowDataIndex);
		numsCellsFill(numsCels, topRowDataIndex, rowsCount);
	};
	cellsFill();

	//
	// scroll

	let scrollTop = 0;
	let scrollLeft = 0;
	let translateY = 0;
	const scroll = () => {
		tableContentDiv.style.transform = `translate(${scrollLeft}px, ${translateY}px)`;
		numsContentDiv.style.transform = `translateY(${translateY}px)`;
	};

	listen(tableOverlayDiv, 'scroll', /** @param {Event & {target:HTMLDivElement}} evt */ evt => {
		scrollTop = evt.target.scrollTop * scrollYKoef;
		scrollLeft = -evt.target.scrollLeft;
		topRowDataIndex = Math.trunc(scrollTop / rowHeight);
		translateY = -scrollTop % rowHeight;

		headerDiv.style.transform = `translateX(${scrollLeft}px)`;
		scroll();
		cellsFill();
	});

	listen(tableOverlayDiv, 'click', /** @param {MouseEvent & {target:HTMLDivElement}} evt */ evt => {
		const rowsDataIndex = Math.trunc(
			// evt.offsetY - overlayDiv.scrollTop = position in table viewPort
			(scrollTop + evt.offsetY - tableOverlayDiv.scrollTop) / rowHeight
		);
		console.log(rowsDataIndex);
	});

	/** @param {number} heigthDelta */
	const scrollResize = heigthDelta => {
		viewPortHeight = viewPortHeight + heigthDelta;
		scrollYKoef = scrollYKoefCalc();

		const heightStyle = { height: `${viewPortHeight}px` };
		stylesSet(tableContentDiv, heightStyle);
		stylesSet(tableOverlayDiv, heightStyle);
		stylesSet(numsContentDiv, heightStyle);
	};

	return {
		cellsFill,
		scrollTop: () => {
			scrollTop = 0;
			translateY = 0;
			topRowDataIndex = 0;
			tableOverlayDiv.scrollTo({ top: 0 });
			scroll();
			cellsFill();
		},
		/** @param {number} heigthDelta */
		resize: heigthDelta => {
			if (heigthDelta === 0) { return; }

			scrollResize(heigthDelta);
			if (heigthDelta < 0) { return; }

			const _rowsCountViewPort = rowsCountViewPortCalc();
			if (rowsCountViewPort >= _rowsCountViewPort) { return; }

			rowsAdd(_rowsCountViewPort - rowsCountViewPort);
			rowsCountViewPort = _rowsCountViewPort;

			cellsFill();
		}
	};
};

/**
 * @param {HTMLDivElement} tableDiv
 * @param {number} viewPortHeight
 * @param {number} scrollDivHeight
 * @param {number} scrollDivWidth
 */
const tableCreate = (tableDiv, viewPortHeight, scrollDivHeight, scrollDivWidth) => {
	const tableContentDiv = divWithStyles({ height: `${viewPortHeight}px`, width: `${scrollDivWidth}px` });
	const tableOverlayDiv = divWithStyles({
		height: `${viewPortHeight}px`,
		width: '100%',
		overflow: 'auto',
		position: 'absolute',
		top: '0',
		// @ts-ignore
		scrollbarWidth: 'thin'
	});

	const scrollDiv = divWithStyles({ height: `${scrollDivHeight}px`, width: `${scrollDivWidth}px` });
	tableOverlayDiv.append(scrollDiv);

	tableDiv.append(tableContentDiv, tableOverlayDiv);

	return [tableContentDiv, tableOverlayDiv];
};

/** @param {Array<HTMLDivElement[]>} tableCells, @param {HTMLDivElement} tableContentDiv, @param {number} colsCount, @param {number} rowsCount */
const tableCellsAdd = (tableCells, tableContentDiv, colsCount, rowsCount) => {
	for (let row = 0; row < rowsCount; row++) {
		/** @type {HTMLDivElement[]} */
		const rowCels = new Array(colsCount);
		tableCells.push(rowCels);

		const rowDiv = div('rw');

		for (let col = 0; col < colsCount; col++) {
			const cellDiv = rowCels[col] = div('cl');
			rowDiv.append(cellDiv);
		}

		tableContentDiv.append(rowDiv);
	}
};

/**
 * @param {HTMLDivElement[][]} tableCells
 * @param {any[][]} rowsData
 * @param {{r:Uint32Array}} rowsToDisplay
 * @param {number} fromRowsDataIndex
 */
const tableCellsFill = (tableCells, rowsData, rowsToDisplay, fromRowsDataIndex) => {
	let row = 0;
	for (; fromRowsDataIndex < rowsToDisplay.r.length && fromRowsDataIndex < rowsData.length && row < tableCells.length; fromRowsDataIndex++, row++) {
		const rowData = rowsData[rowsToDisplay.r[fromRowsDataIndex]];
		tableCells[row].forEach((cellDiv, col) => {
			cellDiv.textContent = rowData[col];
		});
	}

	for (; row < tableCells.length; row++) {
		tableCells[row].forEach(cellDiv => { cellDiv.textContent = null; });
	}
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

/** @param {HTMLDivElement[]} cells, @param {HTMLDivElement} numsDiv, @param {number} rowsCount */
const numCellsAdd = (cells, numsDiv, rowsCount) => {
	for (let row = 0; row < rowsCount; row++) {
		cells.push(div('nums-rw'));
	}

	numsDiv.append(...cells);
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
