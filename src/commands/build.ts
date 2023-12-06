import chalk from 'chalk'

import { Cache } from '../lib/cache'
import { Reader } from '../lib/reader'
import { Compiler } from '../lib/compiler'
import { Renderer } from '../lib/renderer'
import { Generator } from '../lib/generator'
import { SingleCommand } from '../types'

interface IParams {
  env?: string
}

const action = async ({ env }: IParams) => {
  const builder = new Builder(env)

  await builder.run().then(() => {
    console.log(chalk.greenBright('Build completed!'))
  })
}

export const build: SingleCommand = {
  command: 'build',
  description: 'build sites',
  action,
  options: [['-e --env <env>', 'set environment', 'prod']],
}

export class Builder {
  constructor(env?: string) {
    if (env) this._env = env
  }

  private _env: string = 'prod'

  async run() {
    const cache = new Cache('build')
    const reader = new Reader(this._env, cache)
    const compiler = new Compiler(reader)
    const renderer = new Renderer(reader)
    const generator = new Generator(reader, cache)

    const parsedPageConfigList = reader.parsedPageConfigList
    if (parsedPageConfigList.length === 0) return

    const promises: Promise<any>[] = [
      new Promise(async (resolve) => {
        console.log(
          chalk.yellowBright('Start to render and generate index page...'),
        )
        const renderedIndexPageConfig =
          renderer.renderIndexPageConfig(parsedPageConfigList)

        const result = await generator.generatePageThroughRenderedConfig(
          renderedIndexPageConfig,
        )
        if (result === 'ok') resolve(result)
      }).then(() => {
        console.log(chalk.greenBright('Generating index page completed!'))
      }),
      new Promise((resolve) => {
        generator.copyAssets().then(() => {
          resolve(true)
        })
      }),
      new Promise((resolve) => {
        generator.copyPublic().then(() => {
          resolve(true)
        })
      }),
    ]
    parsedPageConfigList.forEach((config) => {
      const compiledPageConfig = compiler.compileSinglePageContent(config)
      if (compiledPageConfig) {
        promises.push(
          new Promise(async (resolve) => {
            console.log(
              chalk.yellowBright(
                `Start to render and generate page ${compiledPageConfig.url}...`,
              ),
            )
            const renderedContentPageConfig =
              renderer.renderContentPageConfig(compiledPageConfig)

            const result = await generator.generatePageThroughRenderedConfig(
              renderedContentPageConfig,
            )
            if (result === 'ok') resolve(result)
          }).then(() => {
            console.log(
              chalk.greenBright(
                `Generating page ${compiledPageConfig.url} completed!`,
              ),
            )
          }),
        )
      }
    })

    await Promise.all(promises)
    cache.writeCache()
  }
}
