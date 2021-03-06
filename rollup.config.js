import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';

const isDev = process.env.ROLLUP_WATCH;

function devServe() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;

			let proc = require('child_process')
			let config = {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			}
			server = proc.spawn('npm', ['run', 'start', '--', '--dev'], config);

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js'
	},
	plugins: [
		
		svelte({
			compilerOptions: { dev: isDev }
		}),

		css({ output: 'bundle.css' }), // CSS in its own file

		// For any external dependencies
		resolve({ browser: true, dedupe: ['svelte'] }),
		commonjs(),

		// If dev build
		isDev && devServe(), // Calls `npm run start`
		isDev && livereload('public'), // Watch 'public' directory for changes

		// If prod build
		!isDev && terser() // Calls 'npm run build', minify
	],
	watch: {
		clearScreen: false
	}
};
