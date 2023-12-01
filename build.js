const { nodeExternalsPlugin } = require('esbuild-node-externals')

require('esbuild')
  .build({
    entryPoints: ['src/huno.ts'],
    bundle: true,
    outfile: 'bin/huno.js',
    platform: 'node',
    target: 'node20',
    tsconfig: 'tsconfig.json',
    minify: false,
    loader: {
      '.html': 'text',
    },
    plugins: [
      nodeExternalsPlugin({
        dependencies: false,
      }),
    ],
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
