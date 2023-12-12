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
  private _cacheFilePath = path.join(path.resolve(), '.huno')
  private _cachedData: { [key: string]: any } = {}

  private get cacheExists() {
    return fs.existsSync(this.cacheTarget)
  }

  private get cacheTarget() {
    return path.join(this._cacheFilePath, this._env)
  }

  private readCache() {
    const target = path.join(this.cacheTarget, 'cached.json')
    if (this.cacheExists) {
      const data = fs.readFileSync(target, 'utf-8') || '{}'
      this._cachedData = JSON.parse(data)
    }
  }

  writeCache() {
    if (!this.cacheExists) {
      fs.mkdirSync(this.cacheTarget, { recursive: true })
    }
    const target = path.join(this.cacheTarget, 'cached.json')
    fs.writeFileSync(target, JSON.stringify(this._cachedData), 'utf-8')
  }

  hasContentChanged(key: string, config: ParsedPageConfig) {
    const cachedContentConfig = this._cachedData[key]
    const { content, ...rest } = config
    return !cachedContentConfig || !lodash.isEqual(cachedContentConfig, rest)
  }

  hasCategoryChanged(key: string, config: ParsedCategoryConfig) {
    const cachedCategoryConfig = this._cachedData[key]
    return (
      !cachedCategoryConfig || !lodash.isEqual(cachedCategoryConfig, config)
    )
  }

  checkOutputExists(key: string) {
    const outputFilePath = this._cachedData[key]?.outputFilePath
    return outputFilePath && fs.existsSync(outputFilePath)
  }

  updateCache(key: string, cachedData: any) {
    this._cachedData[key] = cachedData
  }

  updateCoreConfig(coreConfig: CoreConfig) {
    const formerConfig = this._cachedData.coreConfig
    if (!formerConfig || !lodash.isEqual(formerConfig, coreConfig)) {
      console.log(chalk.yellowBright('Detected config files changed...'))
      this._cachedData = {
        coreConfig,
      }
    }
  }
}
