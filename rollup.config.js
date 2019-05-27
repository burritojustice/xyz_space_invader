import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import svelte from 'rollup-plugin-svelte';

export default {
    input: 'AppUI.svelte',
    output: {
      file: 'AppUI.js',
      format: 'umd',
      name: 'AppUI'
    },
    plugins: [
      resolve(),
      commonjs(),
      svelte({
        // By default, all .svelte and .html files are compiled
        extensions: ['.svelte'],

        // Emit CSS as "files" for other plugins to process
        // emitCss: true,

        // Extract CSS into a separate file (recommended).
        // See note below
        // css: function (css) {
        //   console.log(css.code); // the concatenated CSS
        //   console.log(css.map); // a sourcemap

        //   // creates `main.css` and `main.css.map` — pass `false`
        //   // as the second argument if you don't want the sourcemap
        //   css.write('public/main.css');
        // },
      })
    ]
};
