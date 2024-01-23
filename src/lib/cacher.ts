import path from 'path'
import fs from 'fs'
import lodash from 'lodash'
import chalk from 'chalk'

import { Config } from './config'
import { BaseVars, PartialsTemplateItem, SinglePageVars } from '../types'

export class Cacher {
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

  public writeCache() {
    if (!this.cacheExists) {
      fs.mkdirSync(this.cacheTarget, { recursive: true })
    }
    const target = path.join(this.cacheTarget, 'cached.json')
    fs.writeFileSync(target, JSON.stringify(this._cachedData), 'utf-8')
  }

  public hasPageChanged(key: string, pageVars: SinglePageVars) {
    if (!this._cachedData.page) return true
    const cachedPageVars = this._cachedData.page[key]
    return !cachedPageVars || !lodash.isEqual(cachedPageVars, pageVars)
  }

  public checkOutputExists(targetPath: string) {
    const outputExists = fs.existsSync(path.join(targetPath, 'index.html'))
    if (outputExists) return true
    this._cachedData = {}
  }

  public updatePageCache(key: string, data: any) {
    if (this._cachedData.page) {
      this._cachedData.page[key] = data
    } else {
      this._cachedData.page = {
        [key]: data,
      }
    }
  }

  public updateCoreConfig(config: any) {
    const cachedConfig = this._cachedData.config
    if (!cachedConfig || !lodash.isEqual(config, cachedConfig)) {
      console.log(chalk.yellowBright('Detected config file changed...'))
      Reflect.deleteProperty(this._cachedData, 'page')
      this._cachedData.config = config
    }
  }

  public updateBaseVars(baseVars: BaseVars) {
    const cachedBaseVars = this._cachedData.baseVariables
    if (!cachedBaseVars || !lodash.isEqual(baseVars, cachedBaseVars)) {
      console.log(chalk.yellowBright('Detected base variables changed...'))
      Reflect.deleteProperty(this._cachedData, 'page')
      this._cachedData.baseVariables = baseVars
    }
  }

  public updateExtends(extendList: PartialsTemplateItem[]) {
    const cachedExtends = this._cachedData.extends
    if (!cachedExtends || !lodash.isEqual(extendList, cachedExtends)) {
      console.log(chalk.yellowBright('Detected extends changed...'))
      Reflect.deleteProperty(this._cachedData, 'page')
      this._cachedData.extends = extendList
    }
  }
}
