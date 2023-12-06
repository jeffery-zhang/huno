import chalk from 'chalk'

import { Config } from '../lib/config'
import { Path } from '../lib/path'
import { Template } from '../lib/template'
import { Reader } from '../lib/reader'
import { Compiler } from '../lib/compiler'
import { Renderer } from '../lib/renderer'
import { SingleCommand } from '../types'
import { Generator } from '../lib/generator'

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
    const reader = new Reader(this._env)
    const compiler = new Compiler(reader)
    const renderer = new Renderer(reader)
    const generator = new Generator(reader)

    const parsedPageConfigList = reader.parsedPageConfigList
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
                `Start to render and generate page ${compiledPageConfig.relativeFilePath}...`,
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
                `Generating page ${compiledPageConfig.relativeFilePath} completed!`,
              ),
            )
          }),
        )
      }
    })

    await Promise.all(promises)
  }
}
