import { terser } from 'rollup-plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import replace from '@rollup/plugin-replace';

export default {
	input: 'src/worker.js',
	output: {
		file: 'dist/app/worker.js',
		format: 'es',
		plugins: [
			terser({
				mangle: {
					keep_classnames: false,
					keep_fnames: false,
					properties: {
						regex: /^_/
					}
				}
			})]
	},
	plugins: [
		minifyHTML({
			options: {
				shouldMinify(template) {
					return (
						template.parts.some(part => {
							return (
								part.text.includes('<style') ||
								part.text.includes('<div') ||
								part.text.includes('<circle') ||
								part.text.includes('<path') ||
								part.text.includes('<svg')
							);
						})
					);
				},
				minifyOptions: {
					collapseWhitespace: true,
					minifyCSS: true,
					removeComments: true,
					keepClosingSlash: true
				}
			}
		}),
		replace({
			preventAssignment: true
		})
	]
};
