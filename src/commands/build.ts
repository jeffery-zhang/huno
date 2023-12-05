import { Config } from '../lib/config'
import { Path } from '../lib/path'
import { Template } from '../lib/template'
import { Reader } from '../lib/reader'
import { Compiler } from '../lib/compiler'
import { Renderer } from '../lib/renderer'
import { SingleCommand } from '../types'

interface IParams {
  env?: string
}

const action = async ({ env }: IParams) => {
  const builder = new Builder(env)

  await builder.run()
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

    const promises: Promise<any>[] = [
      new Promise((resolve) => {
        const renderedIndexPageConfig =
          renderer.renderIndexPageConfig(parsedPageConfigList)
        resolve(renderedIndexPageConfig)
      }),
    ]
    const parsedPageConfigList = reader.parsedPageConfigList
    parsedPageConfigList.forEach((config) => {
      const compiledPageConfig = compiler.compileSinglePageContent(config)
      if (compiledPageConfig) {
        promises.push(
          new Promise((resolve) => {
            const renderedContentPageConfig =
              renderer.renderContentPageConfig(compiledPageConfig)
            resolve(renderedContentPageConfig)
          }),
        )
      }
    })

    const result = await Promise.all(promises)
    console.log(result)
  }
}
