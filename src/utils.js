/** @param {string=} className } */
export const div = className => {
	const d = document.createElement('div');
	if (className) { d.className = className; }
	return d;
};

/** @param {string} str, @param {string=} className */
export const divWithContent = (str, className) => {
	const d = div(className);
	d.textContent = str;
	return d;
};

/** @param {Partial<CSSStyleDeclaration>} styles */
export const divWithStyles = styles => {
	const d = div();
	setStyles(d, styles);
	return d;
};

/** @param {HTMLDivElement} el, @param {Partial<CSSStyleDeclaration>} styles */
const setStyles = (el, styles) =>
	Object.entries(styles).forEach(style => { el.style[style[0]] = style[1]; });

/**
 * @param {Element | GlobalEventHandlers | EventTarget} el
 * @param {string} type
 * @param {EventListenerOrEventListenerObject} listener
 * */
export const listen = (el, type, listener) => {
	el.addEventListener(type, listener, { passive: true });
	return listener;
};
