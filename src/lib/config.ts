import path from 'path'
import fs from 'fs'
import yaml from 'yaml'
import lodash from 'lodash'

import { IConfig, PageParams } from '../types'
import chalk from 'chalk'

const defaultPageParams: PageParams = {
  baseUrl: '/',
  defaultLang: 'en',
  title: 'Awesome Title',
  description: 'This is an Awesome Description!',
  author: 'Huno',
}

export class Config {
  constructor(env?: string) {
    if (env) this._env = env
  }

  private _configDir = 'config'
  private _configFile = 'config.yaml'
  private _env: string = 'prod'
  private _config: IConfig = {
    contentDir: 'content',
    outputDir: 'dist',
    templateDir: 'template',
    port: 8080,
    PageParams: defaultPageParams,
  }

  get env() {
    return this._env
  }
  get contentDir() {
    return this._config.contentDir
  }
  get outputDir() {
    return this._config.outputDir
  }
  get templateDir() {
    return this._config.templateDir
  }
  get port() {
    return this._config.port
  }
  get pageParams() {
    return this._config.PageParams
  }

  public parseConfig() {
    console.log(chalk.yellowBright('开始解析配置文件...'))

    const baseConfigFilePath = path.join(
      path.resolve(),
      this._configDir,
      this._configFile,
    )
    const configExists = fs.existsSync(baseConfigFilePath)
    const getEnvConfigFileName = () => {
      const [pre, ext] = this._configFile.split('.')
      return path.join(this._configFile, `${pre}.${this.env}.${ext}`)
    }
    const envConfigFilePath = path.join(
      path.resolve(),
      this._configDir,
      getEnvConfigFileName(),
    )
    let baseConfig = {}
    let envConfig = {}
    const envConfigExists = fs.existsSync(envConfigFilePath)
    if (configExists) {
      baseConfig =
        yaml.parse(fs.readFileSync(baseConfigFilePath, 'utf-8')) ?? {}
      this._config = lodash.merge(this._config, baseConfig)
    }
    if (envConfigExists) {
      envConfig = yaml.parse(fs.readFileSync(envConfigFilePath, 'utf-8')) ?? {}
      this._config = lodash.merge(this._config, envConfig)
    }

    console.log(chalk.greenBright('配置加载成功'))
  }
}
