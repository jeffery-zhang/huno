import path from 'path'
import fs from 'fs'
import lodash from 'lodash'
import chalk from 'chalk'

import { CoreConfig, ParsedCategoryConfig, ParsedPageConfig } from '../types'

export class Cache {
  constructor(env: string) {
    this._env = env
    this.readCache()
  }

  private _env: string
  private _cachePath = path.join(path.resolve(), '.huno')
  private _cacheData: { [key: string]: any } = {}

  private get cacheExists() {
    return fs.existsSync(this.cacheTarget)
  }

  private get cacheTarget() {
    return path.join(this._cachePath, this._env)
  }

  readCache() {
    const target = path.join(this.cacheTarget, 'cached.json')
    if (this.cacheExists) {
      const data = fs.readFileSync(target, 'utf-8') || '{}'
      this._cacheData = JSON.parse(data)
    }
  }

  writeCache() {
    if (!this.cacheExists) {
      fs.mkdirSync(this.cacheTarget, { recursive: true })
    }
    const target = path.join(this.cacheTarget, 'cached.json')
    fs.writeFileSync(target, JSON.stringify(this._cacheData), 'utf-8')
  }

  hasContentChanged(key: string, config: ParsedPageConfig) {
    const CachedContentConfig = this._cacheData[key]
    return !CachedContentConfig || lodash.isEqual(CachedContentConfig, config)
  }

  hasCategoryChanged(key: string, config: ParsedCategoryConfig) {
    const cachedCategoryConfig = this._cacheData[key]
    return !lodash.isEqual(cachedCategoryConfig, config)
  }

  checkOutputExists(key: string) {
    const outputTarget = this._cacheData[key]?.outputTarget
    return outputTarget && fs.existsSync(outputTarget)
  }

  updateCache(key: string, cachedData: any) {
    this._cacheData[key] = cachedData
  }

  updateCoreConfig(coreConfig: CoreConfig) {
    const formerConfig = this._cacheData.coreConfig
    if (!formerConfig || !lodash.isEqual(formerConfig, coreConfig)) {
      console.log(chalk.yellowBright('Detected config files changed...'))
      this._cacheData = {
        coreConfig,
      }
    }
  }
}
