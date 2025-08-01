const TableFast = {
	// DOM from utils.js
	div(className) {
		const d = document.createElement('div');
		if (className) { d.className = className; }
		return d;
	},

	divWithContent(str, className) {
		const d = this.div(className);
		d.textContent = str;
		return d;
	},

	divWithStyles(styles) {
		const d = this.div();
		this.stylesSet(d, styles);
		return d;
	},

	stylesSet(el, styles) {
		Object.entries(styles).forEach(style => { el.style[style[0]] = style[1]; });
	},

	listen(el, type, listener) {
		el.addEventListener(type, listener, { passive: true });
		return listener;
	},

	getById(id) {
		return document.getElementById(id);
	},

	// array from utils.js
	arrExtend(srcArray, arrayToAdd) {
		arrayToAdd.forEach(el => srcArray.push(el));
	},

	uint32ArrayWithNumbers(length) {
		const array = new Uint32Array(length);
		for (let ii = 0; ii < length; ii++) {
			array[ii] = ii;
		}
		return array;
	},

	async arrForEachChunk(arr, chunkSize, forEachCallBack, chunkEndCallBack) {
		let ii = 0;

		const processChunk = async (size) => {
			const chunkLastIndex = ii + size;
			for (; ii < chunkLastIndex; ii++) {
				forEachCallBack(arr[ii], ii);
			}
			return await chunkEndCallBack();
		};

		const fullChunksCount = Math.trunc(arr.length / chunkSize);
		for (let chunkIndex = 0; chunkIndex < fullChunksCount; chunkIndex++) {
			if (!await processChunk(chunkSize)) { return; }
		}
		await processChunk(arr.length - ii);
	},

	// events from utils.js
	wait(ms) {
		return new Promise(resolve => setTimeout(resolve, ms ?? 0));
	},

	// from table.js
	MAX_HEIGHT_PX: 15_000_000,

	table(headerDiv, numsDiv, tableDiv, rowHeight, cellWidth, cols, rowsCount, rowsData, rowsToDisplay) {
		let topRowDataIndex = 0;

		let viewPortHeight = tableDiv.clientHeight;
		const allRowsHeight = rowsCount * rowHeight;
		const scrolHeight = Math.min(allRowsHeight, this.MAX_HEIGHT_PX);

		const scrollYKoefCalc = () =>
			(allRowsHeight - viewPortHeight) / (scrolHeight - viewPortHeight);
		let scrollYKoef = scrollYKoefCalc();

		const rowsCountViewPortCalc = () => Math.ceil(viewPortHeight / rowHeight) + 1;
		let rowsCountViewPort = rowsCountViewPortCalc();

		headerDiv.append(...cols.map(col => this.divWithContent(col, 'hdr')));

		const [tableContentDiv, tableOverlayDiv] = this._tableCreate(
			tableDiv,
			viewPortHeight,
			scrolHeight,
			cellWidth * cols.length
		);
		const numsContentDiv = this._numsColCreate(numsDiv, viewPortHeight);

		const tableCells = [];
		const numsCels = [];

		const rowsAdd = rowsToAdd => {
			this._tableCellsAdd(tableCells, tableContentDiv, cols.length, rowsToAdd);
			this._numCellsAdd(numsCels, numsContentDiv, rowsToAdd);
		};
		rowsAdd(rowsCountViewPort);

		const cellsFill = () => {
			this._tableCellsFill(tableCells, rowsData, rowsToDisplay, topRowDataIndex);
			this._numsCellsFill(numsCels, topRowDataIndex, rowsCount);
		};
		cellsFill();

		let scrollTop = 0;
		let scrollLeft = 0;
		let translateY = 0;
		const scroll = () => {
			tableContentDiv.style.transform = `translate(${scrollLeft}px, ${translateY}px)`;
			numsContentDiv.style.transform = `translateY(${translateY}px)`;
		};

		this.listen(tableOverlayDiv, 'scroll', evt => {
			scrollTop = evt.target.scrollTop * scrollYKoef;
			scrollLeft = -evt.target.scrollLeft;
			topRowDataIndex = Math.trunc(scrollTop / rowHeight);
			translateY = -scrollTop % rowHeight;

			headerDiv.style.transform = `translateX(${scrollLeft}px)`;
			scroll();
			cellsFill();
		});

		this.listen(tableOverlayDiv, 'click', evt => {
			const rowsDataIndex = Math.trunc(
				(scrollTop + evt.offsetY - tableOverlayDiv.scrollTop) / rowHeight
			);
			console.log(rowsDataIndex);
		});

		const scrollResize = heigthDelta => {
			viewPortHeight = viewPortHeight + heigthDelta;
			scrollYKoef = scrollYKoefCalc();

			const heightStyle = { height: `${viewPortHeight}px` };
			this.stylesSet(tableContentDiv, heightStyle);
			this.stylesSet(tableOverlayDiv, heightStyle);
			this.stylesSet(numsContentDiv, heightStyle);
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
	},

	_tableCreate(tableDiv, viewPortHeight, scrollDivHeight, scrollDivWidth) {
		const tableContentDiv = this.divWithStyles({ height: `${viewPortHeight}px`, width: `${scrollDivWidth}px` });
		const tableOverlayDiv = this.divWithStyles({
			height: `${viewPortHeight}px`,
			width: '100%',
			overflow: 'auto',
			position: 'absolute',
			top: '0',
			scrollbarWidth: 'thin'
		});

		const scrollDiv = this.divWithStyles({ height: `${scrollDivHeight}px`, width: `${scrollDivWidth}px` });
		tableOverlayDiv.append(scrollDiv);

		tableDiv.append(tableContentDiv, tableOverlayDiv);

		return [tableContentDiv, tableOverlayDiv];
	},

	_tableCellsAdd(tableCells, tableContentDiv, colsCount, rowsCount) {
		for (let row = 0; row < rowsCount; row++) {
			const rowCels = new Array(colsCount);
			tableCells.push(rowCels);

			const rowDiv = this.div('rw');

			for (let col = 0; col < colsCount; col++) {
				const cellDiv = rowCels[col] = this.div('cl');
				rowDiv.append(cellDiv);
			}

			tableContentDiv.append(rowDiv);
		}
	},

	_tableCellsFill(tableCells, rowsData, rowsToDisplay, fromRowsDataIndex) {
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
	},

	_numsColCreate(numsDiv, numsDivHeight) {
		const contentDiv = this.divWithStyles({ height: `${numsDivHeight}px` });
		numsDiv.append(contentDiv);
		return contentDiv;
	},

	_numCellsAdd(cells, numsDiv, rowsCount) {
		for (let row = 0; row < rowsCount; row++) {
			cells.push(this.div('nums-rw'));
		}

		numsDiv.append(...cells);
	},

	_numsCellsFill(numsCells, fromRowsDataIndex, rowsCount) {
		fromRowsDataIndex++;
		let row = 0;
		for (; fromRowsDataIndex <= rowsCount && row < numsCells.length; fromRowsDataIndex++, row++) {
			numsCells[row].textContent = '' + fromRowsDataIndex;
			numsCells[row].style.display = null;
		}

		for (; row < numsCells.length; row++) {
			numsCells[row].style.display = 'none';
		}
	}
};