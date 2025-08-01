// @ts-nocheck
/** Indexes in {data} to display. Used for filtering and sorting */
const rowsToDisplay = { r: TableFast.uint32ArrayWithNumbers(1_000_000) };
const tableData = DataGen.dataGenerate(1_000_000, 20);

const tbl = TableFast.table(
    // headerDiv
    /** @type {HTMLDivElement} */(TableFast.getById('hdr')),
    // colRowNumDiv
    /** @type {HTMLDivElement} */(TableFast.getById('nums')),
    // tableDiv
    /** @type {HTMLDivElement} */(TableFast.getById('tbl')),
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

let _str = null;

const filter = async (str) => {
    _str = str;

    if (str.length === 0) {
        rowsToDisplay.r = TableFast.uint32ArrayWithNumbers(tableData.length);
        tbl.cellsFill();
        return;
    }

    const filteredRows = [];
    const post = () => {
        rowsToDisplay.r = new Uint32Array(filteredRows);
        tbl.cellsFill();
    };

    let postedRowsCount = 0;

    const search = (row, index) => {
        if (row[0]?.toLocaleLowerCase().indexOf(str) !== -1) {
            filteredRows.push(index);
            return true;
        }
        return false;
    };

    const searchFirst = (row, index) => {
        if (search(row, index)) {
            // first 100 found
            if (filteredRows.length === 100) {
                postedRowsCount = filteredRows.length;
                post();
                forEachCallBack = search;
            }
        } else if ((index === 5_000 || index === tableData.length - 1) && filteredRows.length === 0) {
            post();
            forEachCallBack = search;
        }
    };

    let forEachCallBack = searchFirst;

    await TableFast.arrForEachChunk(
        tableData,
        // chunkSize
        5_000,
        // forEachCallBack
        (row, index) => forEachCallBack(row, index),
        // chunkEndCallBack
        async () => {
            await TableFast.wait(); // let other tasks go
            if (_str !== str) { return false; }

            if (postedRowsCount !== filteredRows.length) {
                postedRowsCount = filteredRows.length;
                post();
            }

            return true;
        }
    );
};

TableFast.listen(TableFast.getById('serch'), 'input', evt => {
    filter(evt.target.value.toLowerCase());
    tbl.scrollTop();
});

let visualViewportheight = visualViewport.height;
TableFast.listen(visualViewport, 'resize', evt => {
    const height = visualViewport.height;
    tbl.resize(height - visualViewportheight);
    visualViewportheight = height;
});
