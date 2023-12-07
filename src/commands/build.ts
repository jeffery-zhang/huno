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
    const reader = new Reader(this._env)
    const compiler = new Compiler(reader)
    const renderer = new Renderer(reader)
    const generator = new Generator(reader, cache)

    const parsedPageConfigList = reader.parsedPageConfigList
    const parsedCategoryConfigList = reader.parsedCategoryConfigList
    if (parsedPageConfigList.length === 0) return

    const promises: Promise<any>[] = [
      await generator.copyAssets(),
      await generator.copyPublic(),
      new Promise<string>(async (resolve) => {
        console.log(
          chalk.yellowBright('Start to render and generate index page...'),
        )
        cache.updateCoreConfig(reader.coreConfig)
        const renderedIndexPageConfig =
          renderer.renderIndexPageConfig(parsedPageConfigList)

        const result = await generator.generateIndexPage(
          renderedIndexPageConfig,
        )
        if (result === 'ok') {
          resolve(chalk.greenBright('Generating index page completed!'))
        }
      }).then((msg) => {
        console.log(msg)
      }),
    ]

    parsedCategoryConfigList.forEach((config) => {
      promises.push(
        new Promise<string>(async (resolve) => {
          console.log(
            chalk.yellowBright(
              `Start to render and generate category page ${config.category}...`,
            ),
          )
          if (cache.hasCategoryChanged(config.url, config)) {
            const renderedCategoryListPageConfig =
              renderer.renderCategoryListPageConfig(
                config,
                reader.getContentOfCategoryConfigList(config.category),
              )

            const result = await generator.generateCategoryPage(
              renderedCategoryListPageConfig,
            )
            if (result === 'ok') {
              resolve(
                chalk.greenBright(`Generating page ${config.url} completed!`),
              )
            }
          }
          resolve(
            chalk.yellowBright(
              `Skip building ${config.url} page by using cache...`,
            ),
          )
        }).then((msg) => {
          console.log(msg)
        }),
      )
    })
    parsedPageConfigList.forEach((config) => {
      const compiledPageConfig = compiler.compileSinglePageContent(config)
      if (compiledPageConfig) {
        promises.push(
          new Promise<string>(async (resolve) => {
            console.log(
              chalk.yellowBright(
                `Start to render and generate page ${compiledPageConfig.url}...`,
              ),
            )
            if (cache.hasContentChanged(config.url, config)) {
              const renderedContentPageConfig =
                renderer.renderContentPageConfig(compiledPageConfig)

              const result = await generator.generatePageThroughRenderedConfig(
                renderedContentPageConfig,
              )
              if (result === 'ok')
                resolve(
                  chalk.greenBright(
                    `Generating page ${compiledPageConfig.url} completed!`,
                  ),
                )
            }
            resolve(
              chalk.yellowBright(
                `Skip building ${config.url} page by using cache...`,
              ),
            )
          }).then((msg) => {
            console.log(msg)
          }),
        )
      }
    })

    await Promise.all(promises)
    cache.writeCache()
  }
}
