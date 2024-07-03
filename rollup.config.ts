import typescript from "@rollup/plugin-typescript"
import {babel} from "@rollup/plugin-babel"
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import {dts} from "rollup-plugin-dts";
import {terser} from "rollup-plugin-terser"

export default [
    {
        input: "./src/index.ts",
        output: [
            {
                file: "./dist/index.es.js",
                format: "es"
            },
            {
                file: "./dist/index.cjs.js",
                format: "cjs"
            }
        ],
        plugins: [
            nodeResolve(),
            commonjs(),
            babel({babelHelpers: 'bundled'}),
            typescript(),
            terser()
        ]
    },
    {
        input: "./src/index.ts",
        output: {
            file: "./typings/index.d.ts",
            format: "es"
        },
        plugins: [
            dts()
        ]
    }
]