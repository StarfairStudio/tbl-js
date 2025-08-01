(function() {
	const TableFast = {
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
		}
	};

	const DataGen = {
		dataGenerate(rowsCount, colCount) {
			const rowsData = new Array(rowsCount);
			for (let row = 0; row < rowsCount; row++) {
				const rowCols = rowsData[row] = new Array(colCount);
				rowCols[0] = this.nameGenerate();
				for (let col = 1; col < colCount; col++) {
					rowCols[col] = Math.floor(Math.random() * 10000);
				}
			}
			return rowsData;
		},

		adjective: ['Excited', 'Anxious', 'Overweight', 'Demonic', 'Jumpy', 'Misunderstood', 'Squashed', 'Gargantuan', 'Broad', 'Crooked', 'Curved', 'Deep', 'Even', 'Excited', 'Anxious', 'Overweight', 'Demonic', 'Jumpy', 'Misunderstood', 'Squashed', 'Gargantuan', 'Broad', 'Crooked', 'Curved', 'Deep', 'Even', 'Flat', 'Hilly', 'Jagged', 'Round', 'Shallow', 'Square', 'Steep', 'Straight', 'Thick', 'Thin', 'Cooing', 'Deafening', 'Faint', 'Harsh', 'High-pitched', 'Hissing', 'Hushed', 'Husky', 'Loud', 'Melodic', 'Moaning', 'Mute', 'Noisy', 'Purring', 'Quiet', 'Raspy', 'Screeching', 'Shrill', 'Silent', 'Soft', 'Squeaky', 'Squealing', 'Thundering', 'Voiceless', 'Whispering'],
		object: ['Taco', 'Operating System', 'Sphere', 'Watermelon', 'Cheeseburger', 'Apple Pie', 'Spider', 'Dragon', 'Remote Control', 'Soda', 'Barbie Doll', 'Watch', 'Purple Pen', 'Dollar Bill', 'Stuffed Animal', 'Hair Clip', 'Sunglasses', 'T-shirt', 'Purse', 'Towel', 'Hat', 'Camera', 'Hand Sanitizer Bottle', 'Photo', 'Dog Bone', 'Hair Brush', 'Birthday Card'],
		nameGenerate() {
			return this.adjective[Math.floor(Math.random() * this.adjective.length)] + ' ' + this.object[Math.floor(Math.random() * this.object.length)];
		}
	};

	const workerData = [];

	onmessage = async function (evt) {
		switch (evt.data[0]) {
			case 1: await filter(evt.data[1]); break;
			case 0: dataInit(evt.data[1], evt.data[2], evt.data[3]); break;
		}
	};

	const dataInit = (initData, rowsCount, colCount) => {
		const CHUNK_SIZE = 10000;

		TableFast.arrExtend(workerData, initData);
		const post = (rwCount) => {
			const chunkData = DataGen.dataGenerate(rwCount, colCount);
			postMessage([0, chunkData]);
			TableFast.arrExtend(workerData, chunkData);
		};

		const chunkFullCount = Math.trunc(rowsCount / CHUNK_SIZE);
		for (let ii = 0; ii < chunkFullCount; ii++) {
			post(CHUNK_SIZE);
		}
		post(rowsCount - chunkFullCount * CHUNK_SIZE);
	};

	let _str = null;

	const filter = async (str) => {
		_str = str;

		const postUint32Array = (arr) =>
			// @ts-ignore
			self.postMessage([1, arr], [arr.buffer]);

		if (str.length === 0) {
			postUint32Array(TableFast.uint32ArrayWithNumbers(workerData.length));
			return;
		}

		const rowsToDisplay = [];
		const post = () => postUint32Array(new Uint32Array(rowsToDisplay));

		let postedRowsCount = 0;

		const search = (row, index) => {
			if (row[0]?.toLocaleLowerCase().indexOf(str) !== -1) {
				rowsToDisplay.push(index);
				return true;
			}
			return false;
		};

		const searchFirst = (row, index) => {
			if (search(row, index)) {
				// first 100 found
				if (rowsToDisplay.length === 100) {
					postedRowsCount = rowsToDisplay.length;
					post();
					forEachCallBack = search;
				}
			} else if ((index === 5_000 || index === workerData.length - 1) && rowsToDisplay.length === 0) {
				post();
				forEachCallBack = search;
			}
		};

		let forEachCallBack = searchFirst;

		await TableFast.arrForEachChunk(
			workerData,
			// chunkSize
			5_000,
			// forEachCallBack
			(row, index) => forEachCallBack(row, index),
			// chunkEndCallBack
			async () => {
				await TableFast.wait(); // let other tasks go
				if (_str !== str) { return false; }

				if (postedRowsCount !== rowsToDisplay.length) {
					postedRowsCount = rowsToDisplay.length;
					post();
				}

				return true;
			}
		);
	};
})();