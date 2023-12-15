import path from 'path'
import fs from 'fs'
import yaml from 'yaml'
import lodash from 'lodash'
import chalk from 'chalk'

import { CoreConfig, SiteParams } from '../types'

const defaultCoreConfig = {
  contentDir: 'content',
  outputDir: 'dist',
  templateDir: 'template',
  publicDir: 'public',
  templateName: 'default',
  port: 8080,
}
const defaultSiteParams: SiteParams = {
  baseUrl: '/',
  defaultLang: 'en',
  title: 'Awesome Title',
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
  get templateName(): string {
    return this._config.templateName
  }
  get port(): number {
    return this._config.port
  }
  get coreConfig() {
    return this._config
  }
  get siteParams(): SiteParams {
    const baseUrl = this.parseBaseUrl(this._siteParams.baseUrl)
    return {
      ...this._siteParams,
      baseUrl,
    }
  }

  private parseCoreConfig() {}

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
          'No existing site params files found. Huno is now building with default site params...',
        ),
      )
    } else {
      console.log(chalk.greenBright('Site params files loaded!'))
    }
  }
}
