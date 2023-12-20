import chalk from 'chalk'

import { Cache } from '../lib/cache'
import { Reader } from '../lib/reader'
import { Renderer } from './renderer'
import { Generator } from '../lib/generator'

export class Builder {
  constructor(env?: string) {
    if (env) this._env = env
    const reader = new Reader(this._env)
    this._reader = reader
  }

  private _env: string = 'prod'
  private _reader: Reader | null = null

  get reader() {
    return this._reader
  }

  async run() {
    if (!this._reader) {
      console.log(chalk.redBright('Start build failed...'))
      process.exit(1)
    }
    const cache = new Cache(this._env)
    const renderer = new Renderer(this._reader)
    const generator = new Generator(this._reader)
    cache.updateCoreConfig(this._reader.coreConfig)
    cache.updateSiteParams(this._reader.siteParams)

    await this._reader.readFiles()

    const promises: Promise<any>[] = [
      await generator.copyAssets(),
      await generator.copyPublic(),
      await generator.generateContentMapXml(
        this._reader.parsedContentConfigList.map((config) => config.config),
      ),
    ]

    this._reader.parsedContentConfigList.forEach(({ config, content }) => {
      promises.push(
        new Promise<any>(async (resolve) => {
          if (
            !cache.hasPageChanged(config.outputFilePath, config) &&
            cache.checkOutputExists(config.outputFilePath)
          ) {
            resolve(
              chalk.yellowBright(
                `Skip building page ${config.outputFilePath} by cache...`,
              ),
            )
            return
          }
          console.log(
            chalk.yellowBright(
              `Start to generate content page ${config.outputFilePath}...`,
            ),
          )
          const article = renderer.compileSinglePageContent(
            content,
            config.inputFilePath,
          )
          if (!article) {
            resolve(
              chalk.redBright(
                `Generate page ${config.outputFilePath} failed...`,
              ),
            )
            return
          }
          const renderedArticle = renderer.renderCompiledArticleBeforeInsert(
            config,
            article,
          )
          const contentPageConfig = {
            ...config,
            params: {
              ...config.params,
              article: renderedArticle,
            },
          }
          const html =
            renderer.renderPageWithPageConfig(contentPageConfig) ?? ''
          const result = await generator.generatePageByPageConfig(config, html)
          if (result === 'ok') {
            cache.updateCache(config.outputFilePath, config)
            resolve(
              chalk.greenBright(
                `Generate page ${config.outputFilePath} completed!`,
              ),
            )
          } else {
            resolve(
              chalk.redBright(
                `Generate page ${config.outputFilePath} failed...`,
              ),
            )
          }
        }).then((msg: string) => {
          console.log(msg)
        }),
      )
    })

    this._reader.parsedListPageConfigList.forEach((config) => {
      promises.push(
        new Promise<any>(async (resolve) => {
          if (
            !cache.hasPageChanged(config.outputFilePath, config) &&
            cache.checkOutputExists(config.outputFilePath)
          ) {
            resolve(
              chalk.yellowBright(
                `Skip building page ${config.outputFilePath} by cache...`,
              ),
            )
            return
          }
          console.log(
            chalk.yellowBright(
              `Start to generate page ${config.outputFilePath}...`,
            ),
          )
          const html = renderer.renderPageWithPageConfig(config) ?? ''
          const result = await generator.generatePageByPageConfig(config, html)
          if (result === 'ok') {
            cache.updateCache(config.outputFilePath, config)
            resolve(
              chalk.greenBright(
                `Generate page ${config.outputFilePath} completed!`,
              ),
            )
          } else {
            resolve(
              chalk.redBright(
                `Generate page ${config.outputFilePath} failed...`,
              ),
            )
          }
        }).then((msg: string) => {
          console.log(msg)
        }),
      )
    })

    await Promise.all(promises)
    cache.writeCache()
  }
}
