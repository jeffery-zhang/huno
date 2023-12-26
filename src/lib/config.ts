import path from 'path'
import fs from 'fs'
import yaml from 'yaml'
import lodash from 'lodash'
import chalk from 'chalk'

import { CoreConfig, SiteParams, TaxonomyTypeListItem } from '../types'

const defaultCoreConfig: CoreConfig = {
  contentDir: 'content',
  outputDir: 'dist',
  templateDir: 'template',
  publicDir: 'public',
  templateName: 'default',
  port: 8080,
  category: 'category',
  series: 'series',
  tag: 'tag',
}
const defaultSiteParams: SiteParams = {
  baseUrl: '/',
  defaultLang: 'en',
  siteTitle: 'Awesome Title',
  description: 'This is an Awesome WebSite!',
  author: 'Huno',
  keywords: '',
}

export class Config {
  constructor(env: string) {
    this._env = env
    if (env !== 'new') {
      this.parseCoreConfig()
      this.parseSiteParams()
    }
  }

  private _configDir = 'config'
  private _configFile = 'config.yaml'
  private _siteParamsFile = 'site.yaml'
  private _env: string = 'prod'
  private _config: CoreConfig = defaultCoreConfig
  private _siteParams: SiteParams = defaultSiteParams

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
  get templateName(): string {
    return this._config.templateName
  }
  get category(): string | null {
    return this._config.category || null
  }
  get series(): string | null {
    return this._config.series || null
  }
  get tag(): string | null {
    return this._config.tag || null
  }
  get port(): number {
    return this._config.port
  }
  get previewPort(): number {
    return this._config.previewPort ?? this._config.port
  }
  get coreConfig(): CoreConfig {
    return this._config
  }
  get siteParams(): SiteParams {
    const baseUrl = this.parseBaseUrl(this._siteParams.baseUrl)
    return {
      ...this._siteParams,
      baseUrl,
    }
  }
  set categories(categories: TaxonomyTypeListItem[]) {
    this._siteParams.categories = categories
  }
  set seriesList(seriesList: TaxonomyTypeListItem[]) {
    this._siteParams.seriesList = seriesList
  }
  set tags(tags: TaxonomyTypeListItem[]) {
    this._siteParams.tags = tags
  }

  private parseBaseUrl(url: string) {
    if (!url.endsWith('/')) {
      return url + '/'
    }
    return url
  }

  private parseCoreConfig() {
    console.log(chalk.yellowBright('Start parsing config files...'))
    const configFilePath = path.join(
      path.resolve(),
      this._configDir,
      this._configFile,
    )
    const configFileExists = fs.existsSync(configFilePath)
    if (configFileExists) {
      const config = yaml.parse(fs.readFileSync(configFilePath, 'utf-8')) ?? {}
      this._config = lodash.merge(this._config, config)
    } else {
      console.log(
        chalk.yellowBright('No exist config file, use default config'),
      )
    }
    console.log(chalk.greenBright('Parse config files completed!'))
  }

  private parseSiteParams() {
    console.log(chalk.yellowBright('Start parsing site params files...'))

    const baseSiteParamsFilePath = path.join(
      path.resolve(),
      this._configDir,
      this._siteParamsFile,
    )
    const siteParamsFileExists = fs.existsSync(baseSiteParamsFilePath)
    const getEnvSiteParamsFileName = () => {
      const [pre, ext] = this._siteParamsFile.split('.')
      return `${pre}.${this.env}.${ext}`
    }
    const envSiteParamsFilePath = path.join(
      path.resolve(),
      this._configDir,
      getEnvSiteParamsFileName(),
    )
    let baseSiteParams = {}
    let envSiteParams = {}
    const envSiteParamsExists = fs.existsSync(envSiteParamsFilePath)
    if (siteParamsFileExists) {
      baseSiteParams =
        yaml.parse(fs.readFileSync(baseSiteParamsFilePath, 'utf-8')) ?? {}
      this._siteParams = lodash.merge(this._siteParams, baseSiteParams)
    }
    if (envSiteParamsExists) {
      envSiteParams =
        yaml.parse(fs.readFileSync(envSiteParamsFilePath, 'utf-8')) ?? {}
      this._siteParams = lodash.merge(this._siteParams, envSiteParams)
    }
    if (!siteParamsFileExists && !envSiteParamsExists) {
      console.log(
        chalk.yellowBright(
          'No exist site params files found, use default site params...',
        ),
      )
    } else {
      console.log(chalk.greenBright('Site params files loaded!'))
    }
  }
}
