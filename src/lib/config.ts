import path from 'path'
import fs from 'fs'
import yaml from 'yaml'
import lodash from 'lodash'
import chalk from 'chalk'

import { BaseVars } from '../types'

export class Config {
  private _env: string = 'prod' // 环境变量, 通过命令传入
  private _configDir = 'config' // 配置文件目录
  private _configFile = 'config.yaml' // 配置文件名称
  private _coreConfigKeys = [
    'contentDir',
    'publicDir',
    'templateDir',
    'templateName',
    'outputDir',
    'port',
    'previewPort',
    'contentMap',
    'plugins',
  ]

  public contentDir: string = 'content' // 文章存放的目录
  public publicDir: string = 'public' // 静态资源目录
  public templateDir: string = 'template' // 模板目录
  public templateName: string = 'default' // 模板名称
  public partialsDir: string = 'partials' // 扩展模板目录
  public outputDir: string = 'dist' // 输出目录
  public port: number = 8080 // dev server 端口
  public previewPort: number = 9000 // preview server 端口
  public contentMap: boolean = false // 是否生成 contentMap
  public plugins: string[] = []
  private _baseVars: BaseVars = {
    baseUrl: '/',
    title: 'Huno',
  }

  constructor(env: string) {
    this._env = env
    if (env !== 'new') {
      this.buildConfig()
    }
  }

  private buildConfig() {
    console.log(chalk.yellowBright('building Huno configures...'))
    const configFilePath = path.join(
      path.resolve(),
      this._configDir,
      this._configFile,
    )
    const envConfigFilePath = path.join(
      path.resolve(),
      this._configDir,
      `config.${this.env}.yaml`,
    )
    const configFileExists = fs.existsSync(configFilePath)
    const envConfigFileExists = fs.existsSync(envConfigFilePath)
    if (configFileExists || envConfigFileExists) {
      if (configFileExists) {
        const config =
          yaml.parse(fs.readFileSync(configFilePath, 'utf-8')) ?? {}
        this.mergeConfig(config)
      }
      if (envConfigFileExists) {
        const config =
          yaml.parse(fs.readFileSync(envConfigFilePath, 'utf-8')) ?? {}
        this.mergeConfig(config)
      }
      console.log(chalk.greenBright('Building configures completed!'))
    } else {
      console.log(
        chalk.yellowBright('no existing config files, using default config'),
      )
    }
  }

  private mergeConfig(config: any) {
    const coreConfig = Object.fromEntries(
      Object.keys(config)
        .filter((key) => this._coreConfigKeys.includes(key))
        .map((key) => [key, config[key]]),
    )
    const variables = config.baseVariables ?? {}
    lodash.merge(this, coreConfig)
    lodash.merge(this._baseVars, variables)
  }

  public get env() {
    return this._env
  }
  public get baseVars() {
    return {
      ...this._baseVars,
      baseUrl: this._baseVars.baseUrl.endsWith('/')
        ? this._baseVars.baseUrl
        : `${this._baseVars.baseUrl}/`,
    }
  }

  public get coreConfig() {
    const obj: any = {}
    this._coreConfigKeys.forEach((key) => {
      obj[key] = this[key as keyof Config]
    })
    return obj
  }

  public setBaseVars(key: string, value: any) {
    this._baseVars[key] = value
  }
}
