import { globSync } from 'glob'

import { Path } from './path'

export class Plugins {
  private _config: Path | null = null

  constructor(config: Path) {
    if (!config) return
    this._config = config
  }

  private loadLocalPlugins() {
    const pluginsFolders = globSync(`${this._config!.pluginsPath}/*/`)
    console.log(pluginsFolders)
  }

  public loadPlugins() {
    this.loadLocalPlugins()
  }
}
