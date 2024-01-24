import path from 'path'
import fs from 'fs'
import chalk from 'chalk'

import { Path } from './path'
import { Huno } from './huno'
import { HunoPlugin } from '../types'

export class Plugins {
  private _config: Path | null = null

  public plugins: HunoPlugin[] = []

  constructor(config: Path) {
    if (!config) return
    this._config = config
  }

  public loadPlugins(pluginsPath: string[]) {
    pluginsPath.forEach((p) => {
      const targetPath = path.join(this._config!.rootPath, p)
      if (fs.existsSync(targetPath)) {
        const plugin = require(targetPath)
        this.plugins.push(plugin)
      } else {
        console.log(chalk.redBright(`Plugin ${p} not found!`))
      }
    })
  }

  public async excutePlugins(ctx: Huno) {
    const promises: Promise<void>[] = []

    this.plugins.forEach((p) => {
      if (typeof p === 'function') {
        const pluginObj = p(ctx)
        if (Reflect.has(pluginObj, 'init')) {
          const init = pluginObj.init
          promises.push(
            new Promise(async (resolve) => {
              await init!()
              resolve()
            }),
          )
        }
      }
    })

    await Promise.all(promises)
  }
}
