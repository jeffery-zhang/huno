import chalk from 'chalk'

import { Cache } from '../lib/cache'
import { Reader } from '../lib/reader'
import { Compiler } from './renderer'
import { Renderer } from './renderer1'
import { Generator } from '../lib/generator'

export class Builder {
  constructor(env?: string) {
    if (env) this._env = env
  }

  private _env: string = 'prod'

  async run() {
    const cache = new Cache(this._env)
    const reader = new Reader(this._env)
    const compiler = new Compiler(reader)
    const renderer = new Renderer(reader)
    const generator = new Generator(reader)

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
          resolve(chalk.greenBright('Generate index page completed!'))
        }
      }).then((msg) => {
        console.log(msg)
      }),
      new Promise<string>(async (resolve) => {
        console.log(
          chalk.yellowBright('Start to generate content map xml file...'),
        )
        const result = await generator.generateContentMapXml(
          parsedPageConfigList,
        )
        if (result === 'ok') {
          resolve(chalk.greenBright(`Generate content map xml file completed!`))
        }
      }).then((msg) => {
        console.log(msg)
      }),
      new Promise<string>(async (resolve) => {
        console.log(
          chalk.yellowBright('Start to render and generate search page...'),
        )
        const renderedSearchPageConfig = renderer.renderSearchPageConfig()

        const result = await generator.generateSearchPage(
          renderedSearchPageConfig,
        )
        if (result === 'ok') {
          resolve(chalk.greenBright('Generate search page completed!'))
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
          if (
            cache.hasCategoryChanged(config.url, config) ||
            !cache.checkOutputExists(config.url)
          ) {
            const renderedCategoryListPageConfig =
              renderer.renderCategoryListPageConfig(
                config,
                reader.getContentOfCategoryConfigList(config.category),
              )

            const result = await generator.generateCategoryPage(
              renderedCategoryListPageConfig,
            )
            if (result === 'ok') {
              const { html, ...rest } = renderedCategoryListPageConfig
              cache.updateCache(renderedCategoryListPageConfig.url, rest)
              resolve(
                chalk.greenBright(`Generate page ${config.url} completed!`),
              )
            }
          }
          resolve(
            chalk.yellowBright(
              `Skip building page ${config.url} by using cache...`,
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
            if (
              cache.hasContentChanged(config.url, config) ||
              !cache.checkOutputExists(config.url)
            ) {
              const renderedContentPageConfig =
                renderer.renderContentPageConfig(compiledPageConfig)

              const result = await generator.generatePageThroughRenderedConfig(
                renderedContentPageConfig,
              )
              if (result === 'ok') {
                const { html, ...rest } = renderedContentPageConfig
                cache.updateCache(renderedContentPageConfig.url, rest)
                resolve(
                  chalk.greenBright(
                    `Generate page ${compiledPageConfig.url} completed!`,
                  ),
                )
              }
            }
            resolve(
              chalk.yellowBright(
                `Skip building page ${config.url} by using cache...`,
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
