import path from 'path'

import { Config } from './config'

export class Path extends Config {
  constructor(env: string) {
    super(env)
  }

  get rootPath(): string {
    return path.resolve()
  }
  get hunoRootPath(): string {
    return path.join(__dirname, '..')
  }
  get contentPath(): string {
    return path.join(this.rootPath, this.contentDir)
  }
  get outputPath(): string {
    const isDev = this.env === 'dev'
    const outputDir = isDev ? '.temp' : this.outputDir
    return path.join(this.rootPath, outputDir)
  }
  get outputContentPath() {
    return path.join(this.outputPath, this.contentDir)
  }
  get outputCategoryPath() {
    if (!this.category) {
      return null
    }
    return path.join(this.outputPath, this.category)
  }
  get outputSeriesPath() {
    if (!this.series) {
      return null
    }
    return path.join(this.outputPath, this.series)
  }
  get outputTagPath() {
    if (!this.tag) {
      return null
    }
    return path.join(this.outputPath, this.tag)
  }
  get customTemplatePath(): string {
    return path.join(this.rootPath, this.templateDir)
  }
  get defaultTemplatePath(): string {
    return path.join(this.hunoRootPath, 'template')
  }
  get templatePath() {
    if (!this.templateName || this.templateName === 'default') {
      return this.defaultTemplatePath
    } else {
      return path.join(this.customTemplatePath, this.templateName)
    }
  }
  get templateAssetsPath() {
    return path.join(this.templatePath, 'assets')
  }
  get publicPath(): string {
    return path.join(this.rootPath, this.publicDir)
  }

  public getEncodedUrl(url: string) {
    return url
      .split('/')
      .map((u) => encodeURI(u))
      .join('/')
  }

  public getPageUrlByInputFilePath(inputFilePath: string): string {
    return inputFilePath
      .replace(this.rootPath, '')
      .replace(/\\/g, '/')
      .slice(1)
      .replace('.md', '')
      .split('/')
      .map((url) => encodeURI(url))
      .join('/')
  }

  public getOutputFilePathByInputFilePath(inputFilePath: string) {
    return inputFilePath
      .replace(this.rootPath, this.outputPath)
      .replace('.md', '')
  }
}
