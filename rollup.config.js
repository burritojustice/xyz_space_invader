import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourcemaps from 'rollup-plugin-sourcemaps';
import postcss from 'rollup-plugin-postcss';
import svelte from 'rollup-plugin-svelte';

export default {
    input: 'index.js',
    output: {
      file: 'dist/index.js',
      format: 'umd',
      // sourcemap: 'inline',
      sourcemap: true,
      name: 'XYZSpaceInvader'
    },
    plugins: [
      sourcemaps(),
      resolve(),
      commonjs(),
      postcss({
        plugins: []
      }),
      svelte({
        // By default, all .svelte and .html files are compiled
        extensions: ['.svelte'],

        // Emit CSS as "files" for other plugins to process
        // emitCss: true,

        // Extract CSS into a separate file (recommended).
        // See note below
        css: function (css) {
          // creates `main.css` and `main.css.map` — pass `false`
          // as the second argument if you don't want the sourcemap
          css.write('dist/index.css');
        },
      })
    ]
};
