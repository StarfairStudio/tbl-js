/** @param {string} className } */
export const div = className => {
	const d = document.createElement('div');
	d.className = className;
	return d;
};

/**
 * @param {Element | GlobalEventHandlers | EventTarget} el
 * @param {string} type
 * @param {EventListenerOrEventListenerObject} listener
 * */
export const listen = (el, type, listener) => {
	el.addEventListener(type, listener, { passive: true });
	return listener;
};
