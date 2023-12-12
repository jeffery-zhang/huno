import path from 'path'
import fs from 'fs'
import yaml from 'yaml'
import lodash from 'lodash'
import chalk from 'chalk'

import { CoreConfig, PageParams, ParsedCategoryConfig } from '../types'

const defaultPageParams: PageParams = {
  baseUrl: '/',
  defaultLang: 'en',
  title: 'Awesome Title',
  description: 'This is an Awesome Description!',
  author: 'Huno',
  keywords: [],
  categories: [],
}

export class Config {
  constructor(env: string, projectName?: string) {
    this._env = env
    if (projectName) {
      this._projectName = projectName
    }
    this.parseConfig()
  }

  private _configDir = 'config'
  private _configFile = 'config.yaml'
  private _projectName = ''
  private _env: string = 'prod'
  private _config: CoreConfig = {
    contentDir: 'content',
    outputDir: 'dist',
    templateDir: 'template',
    publicDir: 'public',
    port: 8080,
    templateName: 'default',
    outputCategoryDir: 'category',
    pageParams: defaultPageParams,
  }

  private parseBaseUrl(url: string) {
    if (!url.endsWith('/')) {
      return url + '/'
    }
    return url
  }

  get env(): string {
    return this._env
  }
  get contentDir(): string {
    return this._config.contentDir
  }
  get outputDir(): string {
    return this._config.outputDir
  }
  get templateDir(): string {
    return this._config.templateDir
  }
  get publicDir(): string {
    return this._config.publicDir
  }
  get port(): number {
    return this._config.port
  }
  get templateName(): string {
    return this._config.templateName
  }
  get outputCategoryDir(): string {
    return this._config.outputCategoryDir
  }
  get pageParams(): PageParams {
    const baseUrl = this.parseBaseUrl(this._config.pageParams.baseUrl)
    return {
      ...this._config.pageParams,
      baseUrl,
    }
  }
  get coreConfig() {
    return this._config
  }
  set categoryList(categoryList: ParsedCategoryConfig[]) {
    this._config.pageParams.categories = categoryList
  }

  public parseConfig() {
    console.log(chalk.yellowBright('Start parsing config files...'))

    const baseConfigFilePath = path.join(
      path.resolve(),
      this._configDir,
      this._configFile,
    )
    const configExists = fs.existsSync(baseConfigFilePath)
    const getEnvConfigFileName = () => {
      const [pre, ext] = this._configFile.split('.')
      return `${pre}.${this.env}.${ext}`
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
    if (!configExists && !envConfigExists) {
      console.log(
        chalk.yellowBright(
          'No existing config files found. Huno is now building with default config...',
        ),
      )
    } else {
      console.log(chalk.greenBright('config files loaded!'))
    }
  }
}
