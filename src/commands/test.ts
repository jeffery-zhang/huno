import chalk from 'chalk'

import { Cache } from '../lib/cache'
import { Reader } from '../lib/reader'
import { Renderer } from '../lib/renderer'
import { Generator } from '../lib/generator'
import { SingleCommand } from '../types'

const action = async () => {
  const cache = new Cache('prod')
  const reader = new Reader('prod')
  const renderer = new Renderer(reader)
  const generator = new Generator(reader)
  cache.updateCoreConfig(reader.coreConfig)

  await reader.readFiles()

  const promises: Promise<any>[] = [
    await generator.copyAssets(),
    await generator.copyPublic(),
  ]

  reader.parsedContentConfigList.forEach(({ config, content }) => {
    promises.push(
      new Promise<any>(async (resolve) => {
        if (
          cache.hasPageChanged(config.outputFilePath, config) ||
          !cache.checkOutputExists(config.outputFilePath)
        ) {
          console.log(
            chalk.yellowBright(
              `Start to render and generate content page ${config.outputFilePath}...`,
            ),
          )
          const article = renderer.compileSinglePageContent(
            content,
            config.inputFilePath,
          )
          const contentPageConfig = {
            ...config,
            article,
          }
          const html =
            renderer.renderPageWithPageConfig(contentPageConfig) ?? ''
          const result = await generator.generatePageByPageConfig(config, html)
          if (result === 'ok') {
            cache.updateCache(config.outputFilePath, config)
            resolve(
              chalk.greenBright(
                `Render and generate page ${config.outputFilePath} completed!`,
              ),
            )
          }
        }
        resolve(
          chalk.redBright(
            `Render and generate page ${config.outputFilePath} failed...`,
          ),
        )
      }).then((msg: string) => {
        console.log(msg)
      }),
    )
  })

  reader.parsedListPageConfigList.forEach((config) => {
    promises.push(
      new Promise<any>(async (resolve) => {
        console.log(
          chalk.yellowBright(
            `Start to render and generate page ${config.outputFilePath}...`,
          ),
        )
        const html = renderer.renderPageWithPageConfig(config) ?? ''
        const result = await generator.generatePageByPageConfig(config, html)
        if (result === 'ok') {
          resolve(
            chalk.greenBright(
              `Render and generate page ${config.outputFilePath} completed!`,
            ),
          )
        }
        resolve(
          chalk.redBright(
            `Render and generate page ${config.outputFilePath} failed...`,
          ),
        )
      }).then((msg: string) => {
        console.log(msg)
      }),
    )
  })

  await Promise.all(promises)
}

export const test: SingleCommand = {
  command: 'test',
  description: 'test command',
  action,
}
